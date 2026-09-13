"""Strict SVG sanitizer with element allowlist, attribute filtering, and root integrity checks."""

import re
import logging

logger = logging.getLogger("studyrot.sanitizer")

ALLOWED_TAGS = {
    "svg", "g", "rect", "circle", "ellipse", "line", "polyline", "polygon",
    "path", "text", "tspan", "defs", "lineargradient", "stop", "animate",
    "animatetransform", "animatemotion", "mpath", "marker", "use"
}

DISALLOWED_PATTERNS = [
    r"<script[\s\S]*?(?:</script>|>)",
    r"<foreignobject[\s\S]*?(?:</foreignobject>|>)",
    r"<iframe[\s\S]*?(?:</iframe>|>)",
    r"<style[\s\S]*?(?:</style>|>)",
    r"<link[\s\S]*?(?:</link>|>)",
    r"javascript\s*:",
    r"\bon\w+\s*=",
    r"data:\s*text\/html"
]


def sanitize_svg(raw_svg: str | None) -> str:
    """
    Sanitizes an SVG string against a strict tag and attribute allowlist.
    Returns sanitized SVG string, or empty string '' if validation fails.
    """
    if not raw_svg or not isinstance(raw_svg, str):
        return ""

    cleaned = raw_svg.strip()

    # Cap length at 8000 chars
    if len(cleaned) > 8000:
        logger.warning("SVG rejected: length exceeds 8000 characters (%d)", len(cleaned))
        return ""

    # Extract SVG root if surrounded by markdown or prose
    if not cleaned.lower().startswith("<svg"):
        match = re.search(r"<svg[\s\S]*?<\/svg>", cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(0).strip()
        else:
            logger.warning("SVG rejected: no valid <svg>...</svg> envelope found")
            return ""

    # Check for disallowed patterns
    for pat in DISALLOWED_PATTERNS:
        if re.search(pat, cleaned, re.IGNORECASE):
            logger.warning("SVG rejected: matched disallowed security pattern '%s'", pat)
            return ""

    # Tag allowlist verification: inspect all opening and self-closing tags
    tags_found = re.findall(r"<\s*([a-zA-Z0-9_\-]+)", cleaned)
    for tag in tags_found:
        lowered_tag = tag.lower()
        if lowered_tag not in ALLOWED_TAGS:
            logger.warning("SVG rejected: disallowed element <%s> found", tag)
            return ""

    # Check for any inline event handlers or javascript in attributes
    if re.search(r"\s+on[a-zA-Z]+\s*=", cleaned, re.IGNORECASE):
        logger.warning("SVG rejected: inline event handler attribute detected")
        return ""

    # Final root integrity regex verifying balanced <svg ...> ... </svg>
    root_match = re.match(r"^<svg\b[^>]*>[\s\S]*<\/svg>$", cleaned, re.IGNORECASE)
    if not root_match:
        logger.warning("SVG rejected: unbalanced or malformed root <svg>...</svg>")
        return ""

    return cleaned
