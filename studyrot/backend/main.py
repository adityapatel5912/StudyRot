import io
import json
import re
from typing import Optional, List, Any, Dict
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from prompts import STUDYROT_SYSTEM_PROMPT, FEW_SHOT_SVG_EXAMPLES

app = FastAPI(title="StudyRot Backend")

# Enable CORS for localhost:5173, localhost:3000, and general origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    groq_key: str
    tavily_key: Optional[str] = None
    text: str
    vibe: str = "Instagram"
    is_topic: bool = False
    subject: str = "Science"
    grade: int = 10


def sanitize_svg(raw_svg: Optional[str]) -> str:
    """
    SVG sanitization (server-side):
    Reject if:
    - Not starting with <svg
    - Contains <script, <foreignObject, on\w+=, javascript:, <iframe, <style
    - Length > 6000 chars
    Return empty string on failure.
    """
    if not raw_svg or not isinstance(raw_svg, str):
        return ""
    
    cleaned = raw_svg.strip()
    if not cleaned.startswith("<svg"):
        # Check if wrapped in xml or markdown
        match = re.search(r"<svg[\s\S]*?</svg>", cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(0).strip()
        else:
            return ""

    if len(cleaned) > 6000:
        return ""

    lowered = cleaned.lower()
    dangerous_patterns = [
        r"<script",
        r"<foreignobject",
        r"on\w+\s*=",
        r"javascript:",
        r"<iframe",
        r"<style",
    ]
    for pat in dangerous_patterns:
        if re.search(pat, lowered):
            return ""

    return cleaned


def extract_file_text(file_bytes: bytes, filename: str) -> str:
    """Extracts text from PDF, DOCX, MD, and TXT files."""
    name_lower = filename.lower()
    
    if name_lower.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text = "\n".join([page.extract_text() or "" for page in reader.pages])
            return text.strip()
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""

    elif name_lower.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            return text.strip()
        except Exception as e:
            print(f"Error reading DOCX: {e}")
            return ""

    else:
        # Default text/markdown
        try:
            return file_bytes.decode("utf-8", errors="ignore").strip()
        except Exception as e:
            print(f"Error decoding text file: {e}")
            return ""


def enrich_with_tavily(tavily_key: Optional[str], grade: int, subject: str, topic: str) -> str:
    """
    Search grounding via Tavily API (optional, silent-fail).
    If is_topic OR source text < 500 chars, call Tavily with query:
    'CBSE Class {grade} {subject} {topic} NCERT notes'
    search_depth="advanced", max_results=5
    """
    if not tavily_key or not tavily_key.strip():
        return ""
    
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=tavily_key.strip())
        query = f"CBSE Class {grade} {subject} {topic} NCERT notes"
        response = client.search(query=query, search_depth="advanced", max_results=5)
        results = response.get("results", [])
        snippets = [f"Source: {r.get('title', '')}\n{r.get('content', '')}" for r in results]
        return "\n\n".join(snippets)
    except Exception as e:
        print(f"Tavily search enrichment failed silently: {e}")
        return ""


def call_groq_llm(groq_key: str, user_prompt: str) -> Dict[str, Any]:
    """
    Calls Groq API with model llama-3.3-70b-versatile,
    falls back to llama-3.1-8b-instant on failure.
    """
    from groq import Groq

    client = Groq(api_key=groq_key.strip())
    models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

    last_error = None
    for model in models_to_try:
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": STUDYROT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                model=model,
                temperature=0.7,
                max_tokens=4096,
                response_format={"type": "json_object"},
            )
            raw_content = chat_completion.choices[0].message.content or "{}"
            parsed = json.loads(raw_content)
            if "posts" in parsed and isinstance(parsed["posts"], list):
                return parsed
            # If wrapped differently
            for k, v in parsed.items():
                if isinstance(v, list) and len(v) > 0:
                    return {"posts": v}
            return parsed
        except Exception as e:
            print(f"Groq call failed with {model}: {e}")
            last_error = e

    raise HTTPException(status_code=500, detail=f"Groq generation failed: {last_error}")


def process_generation(
    groq_key: str,
    tavily_key: Optional[str],
    text: str,
    vibe: str,
    is_topic: bool,
    subject: str,
    grade: int,
) -> List[Dict[str, Any]]:
    if not groq_key or not groq_key.strip():
        raise HTTPException(status_code=400, detail="Groq API Key is required.")

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Source text or topic is required.")

    search_context = ""
    if is_topic or len(text) < 500:
        search_context = enrich_with_tavily(tavily_key, grade, subject, text[:150])

    # Construct user prompt
    user_prompt = f"""TASK: Generate 8-12 scrollable StudyRot feed posts for CBSE students.
VIBE: {vibe}
SUBJECT: {subject}
GRADE: Class {grade}
SOURCE MATERIAL:
{text}
"""
    if search_context:
        user_prompt += f"\nADDITIONAL NCERT SEARCH CONTEXT:\n{search_context}\n"

    user_prompt += f"\n{FEW_SHOT_SVG_EXAMPLES}\n"

    result = call_groq_llm(groq_key, user_prompt)
    posts = result.get("posts", [])

    # Post-process and sanitize SVGs
    sanitized_posts = []
    for p in posts:
        diagram = p.get("diagram", "")
        p["diagram"] = sanitize_svg(diagram)
        p["subject"] = subject
        p["grade"] = grade
        sanitized_posts.append(p)

    return sanitized_posts


@app.get("/api/health")
def health_check():
    return {"ok": True}


@app.post("/api/generate")
def generate(req: GenerateRequest):
    posts = process_generation(
        groq_key=req.groq_key,
        tavily_key=req.tavily_key,
        text=req.text,
        vibe=req.vibe,
        is_topic=req.is_topic,
        subject=req.subject,
        grade=req.grade,
    )
    return {"posts": posts}


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    groq_key: str = Form(...),
    tavily_key: Optional[str] = Form(None),
    vibe: str = Form("Instagram"),
    subject: str = Form("Science"),
    grade: int = Form(10),
):
    contents = await file.read()
    extracted_text = extract_file_text(contents, file.filename or "file.txt")
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the uploaded file. Please ensure it is a valid PDF, DOCX, TXT, or MD file."
        )

    posts = process_generation(
        groq_key=groq_key,
        tavily_key=tavily_key,
        text=extracted_text,
        vibe=vibe,
        is_topic=False,
        subject=subject,
        grade=grade,
    )
    return {"posts": posts, "chars": len(extracted_text)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
