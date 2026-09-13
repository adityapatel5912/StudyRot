"""
NVIDIA NIM Integration Module for StudyRot.
Connects to NVIDIA hosted microservices at https://integrate.api.nvidia.com/v1
for Vision (Llama-3.2-11b-vision-instruct), OCR (Nemotron-OCR-v2),
Parsing (Nemotron-Parse-v1.2), Deep Reasoning, and 3D Asset Generation (TRELLIS).
"""

import os
import hashlib
import logging
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException
from config import (
    NVIDIA_API_KEY,
    NVIDIA_VLM_MODEL,
    NVIDIA_REASONING_MODEL,
    NVIDIA_OCR_MODEL,
    NVIDIA_PARSE_MODEL,
    NVIDIA_3D_MODEL,
)

logger = logging.getLogger("studyrot.nvidia")

NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
NVIDIA_GENAI_URL = "https://ai.api.nvidia.com/v1"

# 24-hour cache for generated 3D models (prompt_hash -> glb_url)
_3D_MODEL_CACHE: Dict[str, str] = {}


def is_nvidia_available() -> bool:
    """Returns True if NVIDIA NIM API key is configured."""
    return bool(NVIDIA_API_KEY)


async def vision_describe(image_b64: str, question: str = "Analyze and describe this educational diagram or formula.") -> str:
    """
    Analyzes and describes an educational image, ray diagram, or problem using NVIDIA VLM.
    """
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=503, detail="NVIDIA NIM VLM service is not configured.")

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }

    # Ensure valid base64 data uri
    prefix = "data:image/jpeg;base64," if not image_b64.startswith("data:") else ""
    image_url = f"{prefix}{image_b64}" if prefix else image_b64

    payload = {
        "model": NVIDIA_VLM_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"You are StudyRot Tutor analyzing a student's CBSE science/math question. Question: {question}"},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(f"{NVIDIA_BASE_URL}/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            logger.warning("NVIDIA VLM returned %d: %s", resp.status_code, resp.text[:200])
            raise HTTPException(status_code=resp.status_code, detail="NVIDIA VLM processing failed.")
        except httpx.RequestError as e:
            logger.error("NVIDIA VLM request error: %s", e)
            raise HTTPException(status_code=504, detail="NVIDIA VLM service connection timed out.")


async def ocr_image(image_b64: str) -> Dict[str, Any]:
    """
    Extracts text, equations, and annotations from textbook photos or handwritten work.
    """
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=503, detail="NVIDIA OCR service is not configured.")

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }

    # First attempt dedicated /ocr endpoint if supported by model, else chat completions
    prefix = "data:image/jpeg;base64," if not image_b64.startswith("data:") else ""
    image_url = f"{prefix}{image_b64}" if prefix else image_b64

    payload = {
        "model": NVIDIA_OCR_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract all printed and handwritten text, equations, labels, and problem numbers verbatim from this CBSE study page in markdown format."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
        "max_tokens": 1200,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(f"{NVIDIA_BASE_URL}/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                return {"text": content, "status": "success"}
            logger.warning("NVIDIA OCR returned status %d: %s", resp.status_code, resp.text[:200])
        except Exception as e:
            logger.warning("NVIDIA OCR request failed: %s", e)

    return {"text": "", "status": "fallback"}


async def reason_step_by_step(prompt: str, context: str = "") -> str:
    """
    Performs deep pedagogical reasoning using NVIDIA Nemotron reasoning models.
    """
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=503, detail="NVIDIA Reasoning service is not configured.")

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }

    system_prompt = (
        "You are StudyRot Tutor, an elite CBSE Class 8-12 AI tutor. "
        "Provide thorough, step-by-step solutions using accurate NCERT principles, "
        "clear Cartesian sign conventions, exact LaTeX formulas ($...$), and friendly explanations."
    )
    if context:
        system_prompt += f"\nVerified Curriculum Context:\n{context}"

    payload = {
        "model": NVIDIA_REASONING_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 2048,
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(f"{NVIDIA_BASE_URL}/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            logger.warning("NVIDIA Reasoning returned %d: %s", resp.status_code, resp.text[:200])
            raise HTTPException(status_code=resp.status_code, detail="NVIDIA Reasoning failed.")
        except httpx.RequestError as e:
            logger.error("NVIDIA Reasoning timeout: %s", e)
            raise HTTPException(status_code=504, detail="NVIDIA Reasoning timed out.")


async def generate_3d_model(prompt: str) -> Optional[str]:
    """
    Generates a 3D GLB model via Microsoft TRELLIS on NVIDIA GenAI API.
    Caches results by prompt hash.
    """
    prompt_hash = hashlib.sha256(prompt.strip().lower().encode("utf-8")).hexdigest()
    if prompt_hash in _3D_MODEL_CACHE:
        return _3D_MODEL_CACHE[prompt_hash]

    if not NVIDIA_API_KEY:
        logger.info("NVIDIA_API_KEY missing, skipping 3D TRELLIS model generation.")
        return None

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "prompt": prompt,
        "output_format": "glb",
        "num_objects": 1,
    }

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            resp = await client.post(
                f"{NVIDIA_GENAI_URL}/genai/microsoft/trellis",
                headers=headers,
                json=payload
            )
            if resp.status_code == 200:
                data = resp.json()
                glb_url = data.get("url") or data.get("glb_url")
                if glb_url:
                    _3D_MODEL_CACHE[prompt_hash] = glb_url
                    return glb_url
            logger.warning("NVIDIA TRELLIS returned %d: %s", resp.status_code, resp.text[:200])
        except Exception as e:
            logger.warning("TRELLIS 3D generation error: %s", e)

    return None
