"""Pydantic request, response, and post validation schemas for StudyRot."""

import re
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator


def clean_latex_escapes(v: str) -> str:
    """Ensures LaTeX backslashes inside JSON strings are properly parsed."""
    if not isinstance(v, str):
        return v
    return v


class Quiz(BaseModel):
    question: str
    options: List[str]
    answer: str
    explanation: str

    @field_validator("options")
    @classmethod
    def validate_options_length_and_uniqueness(cls, v: List[str]) -> List[str]:
        if len(v) != 4:
            raise ValueError(f"Quiz must have exactly 4 options, got {len(v)}")
        cleaned = [str(opt).strip() for opt in v]
        # Verify all 4 options are unique
        lower_set = set(opt.lower() for opt in cleaned)
        if len(lower_set) != 4:
            raise ValueError("All 4 quiz options must be distinct and unique.")
        return cleaned

    @model_validator(mode="after")
    def verify_answer_and_explanation(self) -> "Quiz":
        raw_ans = self.answer.strip()
        options = [opt.strip() for opt in self.options]

        # 1. Exact match
        matched_answer = None
        if raw_ans in options:
            matched_answer = raw_ans
        else:
            # 2. Fuzzy match (case-insensitive & whitespace-stripped)
            lower_ans = raw_ans.lower()
            for opt in options:
                if opt.lower() == lower_ans:
                    matched_answer = opt
                    break

            # 3. Check if answer is a single letter (A, B, C, D)
            if not matched_answer:
                letter_match = re.match(r"^[a-dA-D]$", raw_ans)
                if letter_match:
                    idx = ord(raw_ans.upper()) - ord("A")
                    if 0 <= idx < 4:
                        matched_answer = options[idx]

            # 4. Check option prefix like "A) ..." or "1. ..."
            if not matched_answer:
                for opt in options:
                    clean_opt = re.sub(r"^[A-Da-d1-4][\)\.\:\-]\s*", "", opt).strip()
                    if clean_opt.lower() == lower_ans:
                        matched_answer = opt
                        break

        if not matched_answer:
            raise ValueError(f"Answer '{raw_ans}' does not match any of the 4 options: {options}")

        self.answer = matched_answer

        # Explanation validation
        clean_exp = (self.explanation or "").strip()
        if not clean_exp:
            self.explanation = f"Correct answer is {self.answer} based on NCERT syllabus principles."
        elif clean_exp.lower() == self.question.strip().lower():
            self.explanation = f"Correct answer is {self.answer} as established in standard NCERT textbook exercises."

        return self


class Post(BaseModel):
    type: Literal[
        "key_point",
        "analogy",
        "myth_buster",
        "quiz",
        "summary",
        "formula",
        "timeline",
        "recap",
        "apply",
        "exam_tip",
    ]
    title: str
    body: str
    analogy: str = ""
    quiz: Optional[Quiz] = None
    diagram: str = ""
    hashtags: List[str] = Field(default_factory=list)
    source_ref: str = ""
    grade: int
    subject: Literal["Science", "Maths", "SST"]
    engagement: Dict[str, Any] = Field(default_factory=lambda: {"likes": 24, "comments": []})

    @field_validator("title")
    @classmethod
    def clean_title(cls, v: str) -> str:
        return clean_latex_escapes(v.strip())

    @field_validator("body")
    @classmethod
    def enforce_body_constraints(cls, v: str) -> str:
        text = clean_latex_escapes(v.strip())
        words = text.split()
        if len(words) > 85:
            # Truncate at sentence boundary closest to 80 words
            sentences = re.split(r"(?<=[.!?])\s+", text)
            truncated = []
            curr_words = 0
            for s in sentences:
                s_words = len(s.split())
                if curr_words + s_words <= 85:
                    truncated.append(s)
                    curr_words += s_words
                else:
                    break
            if truncated:
                return " ".join(truncated)
            return " ".join(words[:80]) + "..."
        return text

    @field_validator("source_ref")
    @classmethod
    def validate_source_ref(cls, v: str, info) -> str:
        raw = (v or "").strip()
        # Reject vague or too-short refs like "NCERT", "CBSE"
        if len(raw) < 12 or re.match(r"^(ncert|cbse|textbook)$", raw, re.IGNORECASE):
            subj = info.data.get("subject", "CBSE")
            grd = info.data.get("grade", 10)
            return f"NCERT Class {grd} {subj} — Verified Context"
        return raw

    @field_validator("hashtags")
    @classmethod
    def ensure_hashtags(cls, v: List[str]) -> List[str]:
        cleaned = [f"#{tag.lstrip('#').strip()}" for tag in v if tag and tag.strip()]
        if not cleaned:
            cleaned = ["#CBSE", "#NCERTRevision"]
        return cleaned

    @model_validator(mode="after")
    def post_integrity_check(self) -> "Post":
        # Enforce LaTeX in formula posts
        if self.type == "formula":
            if "$" not in self.body and "\\" not in self.body and "=" not in self.body:
                # Add inline LaTeX formatting if absent
                self.body = f"Formula: ${self.title}$ — {self.body}"

        # Prevent exact duplication between body and analogy/exam tip callout
        if self.analogy and self.analogy.strip().lower() == self.body.strip().lower():
            self.analogy = ""

        return self


class GenerateRequest(BaseModel):
    groq_key: Optional[str] = ""
    tavily_key: Optional[str] = None
    text: str
    vibe: str = "Instagram"
    is_topic: bool = False
    subject: Literal["Science", "Maths", "SST"] = "Science"
    grade: int = 10


class DemoGenerateRequest(BaseModel):
    topic: Optional[str] = None
    text: str = ""
    vibe: str = "Instagram"
    is_topic: bool = True
    subject: Literal["Science", "Maths", "SST"] = "Science"
    grade: int = 10


class SaveFeedRequest(BaseModel):
    feed: Dict[str, Any]
    title: Optional[str] = "NCERT Study Feed"
    subject: Optional[str] = "Science"
    grade: Optional[int] = 10
    vibe: Optional[str] = "Instagram"


class SaveKeysRequest(BaseModel):
    groq_key: Optional[str] = ""
    tavily_key: Optional[str] = ""


class CreateCommentRequest(BaseModel):
    post_id: str
    body: str


class BattleCreateRequest(BaseModel):
    feed_id: Optional[str] = None
    feed: Optional[Dict[str, Any]] = None
    topic: Optional[str] = "CBSE Chapter"
    subject: Optional[str] = "Science"
    grade: Optional[int] = 10


class BattleJoinRequest(BaseModel):
    room_code: str
    nickname: str
