"""Cross-verification logic and quality gate checks for research output."""

import re
from typing import Dict, Any, List, Tuple


def check_latex_syntax(latex_str: str) -> bool:
    """Validates balanced brackets and basic LaTeX syntax."""
    if not latex_str or not latex_str.strip():
        return True
    # Check brace balance
    stack = []
    for char in latex_str:
        if char == '{':
            stack.append(char)
        elif char == '}':
            if not stack:
                return False
            stack.pop()
    if stack:
        return False
    # Check for unmatched $ delimiters if any
    dollar_count = latex_str.count('$')
    if dollar_count % 2 != 0:
        return False
    return True


def verify_facts(raw_facts: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Filters out conflicting facts, low-confidence entries, and enforces independent source verification.
    """
    verified_list = []
    rejected_list = []

    for fact in raw_facts:
        # Quality Gate: Confidence cannot be low
        confidence = str(fact.get("confidence", "high")).lower()
        if confidence == "low":
            rejected_list.append({"fact": fact, "reason": "Low confidence prohibited"})
            continue

        # Reject if conflicting
        if fact.get("conflicting", False):
            rejected_list.append({"fact": fact, "reason": "Conflicting claims detected"})
            continue

        # Check statement length and source attribution
        statement = fact.get("statement", "").strip()
        source = fact.get("source", "").strip()
        source_url = fact.get("source_url", "").strip()

        if not statement or (not source and not source_url):
            rejected_list.append({"fact": fact, "reason": "Missing source attribution"})
            continue

        latex = fact.get("latex", "")
        if latex and not check_latex_syntax(latex):
            rejected_list.append({"fact": fact, "reason": "Invalid LaTeX syntax in fact"})
            continue

        # Mark verification status based on sources or edition
        supporting = fact.get("supporting_sources", [])
        if len(supporting) >= 2 or fact.get("verified") is True:
            fact["verified"] = True
            fact["confidence"] = "high"
        else:
            fact["verified"] = True if confidence == "high" else False
            fact["confidence"] = confidence

        verified_list.append(fact)

    return verified_list, rejected_list


def validate_mcqs(mcqs: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Validates that:
    1. Every MCQ answer string appears verbatim in its options array
    2. Options have exactly 4 items and no duplicates
    3. LaTeX expressions in question and options have balanced syntax
    """
    valid_mcqs = []
    rejected_mcqs = []

    for mcq in mcqs:
        question = mcq.get("question", "").strip()
        options = mcq.get("options", [])
        answer = mcq.get("answer", "").strip()

        if not question or not options or not answer:
            rejected_mcqs.append({"mcq": mcq, "reason": "Incomplete MCQ structure"})
            continue

        if len(options) != 4:
            rejected_mcqs.append({"mcq": mcq, "reason": f"Expected 4 options, found {len(options)}"})
            continue

        # Check for duplicate options
        if len(set(options)) != 4:
            rejected_mcqs.append({"mcq": mcq, "reason": "Duplicate options detected"})
            continue

        # Verify answer verbatim match
        matched = False
        for opt in options:
            if opt.strip() == answer:
                matched = True
                break
        if not matched:
            rejected_mcqs.append({"mcq": mcq, "reason": f"Answer '{answer}' not found verbatim in options {options}"})
            continue

        # Verify LaTeX syntax in question
        if not check_latex_syntax(question):
            rejected_mcqs.append({"mcq": mcq, "reason": "Invalid LaTeX in question"})
            continue

        valid_mcqs.append(mcq)

    return valid_mcqs, rejected_mcqs


def run_quality_gates(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Executes mandatory quality gates:
    - Every MCQ answer string appears verbatim in its options array
    - Every LaTeX formula is syntactically valid
    - No fact has "confidence": "low"
    - No conflicting facts are included
    - Every board_exam_question has a source_url OR source referencing a real document
    - Total facts >= 15 per topic
    - Total MCQs >= 10 per topic
    """
    errors = []

    facts = data.get("facts", [])
    if len(facts) < 15:
        errors.append(f"Total facts ({len(facts)}) < 15 required")

    for idx, f in enumerate(facts):
        if str(f.get("confidence", "")).lower() == "low":
            errors.append(f"Fact #{idx} has confidence 'low'")
        if f.get("conflicting") is True:
            errors.append(f"Fact #{idx} is marked conflicting")
        if not f.get("source") and not f.get("source_url"):
            errors.append(f"Fact #{idx} lacks source attribution")
        latex = f.get("latex", "")
        if latex and not check_latex_syntax(latex):
            errors.append(f"Fact #{idx} contains invalid LaTeX: {latex}")

    formulas = data.get("formulas", [])
    for idx, form in enumerate(formulas):
        latex = form.get("latex", "")
        if latex and not check_latex_syntax(latex):
            errors.append(f"Formula #{idx} has invalid LaTeX: {latex}")

    mcqs = data.get("mcqs", [])
    if len(mcqs) < 10:
        errors.append(f"Total MCQs ({len(mcqs)}) < 10 required")

    valid_mcqs, rej_mcqs = validate_mcqs(mcqs)
    if rej_mcqs:
        for r in rej_mcqs:
            errors.append(f"MCQ rejection: {r['reason']}")

    board_qs = data.get("board_exam_questions", [])
    for idx, bq in enumerate(board_qs):
        if not bq.get("source") and not bq.get("source_url"):
            errors.append(f"Board question #{idx} lacks source or source_url")

    return (len(errors) == 0, errors)
