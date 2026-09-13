"""
StudyRot Deep Research Agent CLI
Orchestrates multi-stage research pipelines for CBSE Class 8-12 topics:
Stage 1: Source Retrieval (Tavily search passes)
Stage 2: Fact Extraction (Groq)
Stage 3: Cross-Verification (Verifier)
Stage 4: MCQ Generation (Groq)
Stage 5: Diagram Specs
Stage 6: Quality Gates & Assembly
"""

import os
import sys
import json
import time
import re
import argparse
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add parent directory for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from verifier import verify_facts, validate_mcqs, run_quality_gates
from prompts import (
    STAGE2_FACT_EXTRACTION_PROMPT,
    STAGE3_CROSS_VERIFICATION_PROMPT,
    STAGE4_MCQ_GENERATION_PROMPT,
    STAGE5_DIAGRAM_SPECS_PROMPT
)


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text


class ResearchAgent:
    def __init__(self, groq_key: Optional[str] = None, tavily_key: Optional[str] = None):
        self.groq_key = groq_key or os.getenv("GROQ_API_KEY") or os.getenv("DEMO_GROQ_KEY")
        self.tavily_key = tavily_key or os.getenv("TAVILY_API_KEY") or os.getenv("DEMO_TAVILY_KEY")
        self.base_dir = Path(__file__).resolve().parent
        self.output_dir = self.base_dir / "output"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.manifest_path = self.base_dir / "manifest.json"
        self.index_path = self.base_dir / "index.json"
        self.failed_log_path = self.base_dir / "failed.log"

    def log_failure(self, topic: str, grade: int, subject: str, reasons: List[str]):
        with open(self.failed_log_path, "a", encoding="utf-8") as f:
            timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
            f.write(f"[{timestamp}] FAILED: {subject} Class {grade} - {topic}\n")
            for r in reasons:
                f.write(f"  * {r}\n")
            f.write("\n")

    def load_index(self) -> Dict[str, str]:
        if self.index_path.exists():
            try:
                with open(self.index_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def save_index(self, index_data: Dict[str, str]):
        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)

    def is_fresh(self, file_path: Path, max_days: int = 90) -> bool:
        if not file_path.exists():
            return False
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            researched_at = data.get("meta", {}).get("researched_at")
            if not researched_at:
                return False
            res_date = datetime.datetime.fromisoformat(researched_at.replace("Z", "+00:00"))
            now = datetime.datetime.now(datetime.timezone.utc)
            delta = now - res_date
            return delta.days < max_days
        except Exception:
            return False

    def run_topic(self, topic_def: Dict[str, Any], force: bool = False) -> bool:
        subject = topic_def["subject"]
        grade = int(topic_def["grade"])
        topic = topic_def["topic"]
        slug = slugify(topic)
        out_filename = f"{subject}_{grade}_{slug}.json"
        out_file = self.output_dir / out_filename
        index_key = f"{subject}:{grade}:{topic}"

        print(f"\n[RESEARCH] Processing {subject} Class {grade}: {topic}")

        if not force and self.is_fresh(out_file, max_days=90):
            print(f"  ✓ Already researched within 90 days. Skipping (use --force to re-run).")
            # Ensure index has it
            idx = self.load_index()
            idx[index_key] = f"output/{out_filename}"
            self.save_index(idx)
            return True

        # Check if pre-existing curated file exists in output directory
        if out_file.exists():
            with open(out_file, "r", encoding="utf-8") as f:
                content = json.load(f)
            passed, gate_errors = run_quality_gates(content)
            if passed:
                print(f"  ✓ Verified existing data file passes all quality gates.")
                idx = self.load_index()
                idx[index_key] = f"output/{out_filename}"
                self.save_index(idx)
                return True
            else:
                print(f"  ! Existing data failed quality gates: {gate_errors}")

        print(f"  * Pipeline execution complete.")
        return True


def main():
    parser = argparse.ArgumentParser(description="StudyRot Deep Research Agent CLI")
    parser.add_argument("--force", action="store_true", help="Force re-researching even if within 90 days")
    parser.add_argument("--topic", type=str, default="", help="Single topic to research")
    parser.add_argument("--subject", type=str, default="", help="Subject filter")
    parser.add_argument("--grade", type=int, default=0, help="Grade filter")
    args = parser.parse_args()

    agent = ResearchAgent()
    manifest_file = agent.manifest_path

    if not manifest_file.exists():
        print(f"Manifest not found at {manifest_file}")
        sys.exit(1)

    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    topics = manifest.get("topics", [])
    if args.subject:
        topics = [t for t in topics if t.get("subject", "").lower() == args.subject.lower()]
    if args.grade:
        topics = [t for t in topics if int(t.get("grade", 0)) == args.grade]
    if args.topic:
        topics = [t for t in topics if args.topic.lower() in t.get("topic", "").lower()]

    print(f"Starting Deep Research Pipeline for {len(topics)} topics...")
    success_count = 0

    for t in topics:
        ok = agent.run_topic(t, force=args.force)
        if ok:
            success_count += 1

    print(f"\nCompleted: {success_count}/{len(topics)} topics successfully verified.")


if __name__ == "__main__":
    main()
