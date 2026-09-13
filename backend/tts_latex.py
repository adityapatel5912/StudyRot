"""
LaTeX to Natural Spoken Text Converter for StudyRot TTS.
Converts scientific equations, fractions, superscripts, roots, and Greek symbols
into natural pedagogical speech for students.
"""

import re

GREEK_LETTERS = {
    r"\alpha": "alpha",
    r"\beta": "beta",
    r"\gamma": "gamma",
    r"\delta": "delta",
    r"\Delta": "delta",
    r"\epsilon": "epsilon",
    r"\theta": "theta",
    r"\lambda": "lambda",
    r"\mu": "mu",
    r"\nu": "nu",
    r"\pi": "pi",
    r"\rho": "rho",
    r"\sigma": "sigma",
    r"\tau": "tau",
    r"\phi": "phi",
    r"\omega": "omega",
    r"\Omega": "ohms",
}

SYMBOLS = {
    r"\times": " times ",
    r"\cdot": " dot ",
    r"\div": " divided by ",
    r"\pm": " plus or minus ",
    r"\approx": " approximately equals ",
    r"\neq": " is not equal to ",
    r"\le": " is less than or equal to ",
    r"\leq": " is less than or equal to ",
    r"\ge": " is greater than or equal to ",
    r"\geq": " is greater than or equal to ",
    r"\infty": " infinity ",
    r"\rightarrow": " yields ",
    r"\to": " to ",
    r"\degree": " degrees ",
    r"^\circ": " degrees ",
}

UNITS = {
    r"\text{cm}": " centimeters ",
    r"\text{ cm}": " centimeters ",
    r"\text{m}": " meters ",
    r"\text{ m}": " meters ",
    r"\text{s}": " seconds ",
    r"\text{ s}": " seconds ",
    r"\text{kg}": " kilograms ",
    r"\text{ kg}": " kilograms ",
    r"\text{m/s}": " meters per second ",
    r"\text{ m/s}": " meters per second ",
    r"\text{m/s}^2": " meters per second squared ",
    r"\text{ V}": " volts ",
    r"\text{ A}": " amperes ",
    r"\text{ D}": " dioptres ",
    r"\text{D}": " dioptres ",
    r"\text{J}": " joules ",
    r"\text{ J}": " joules ",
    r"\text{W}": " watts ",
    r"\text{ W}": " watts ",
}


def latex_to_spoken(text: str) -> str:
    """Converts LaTeX-formatted text to natural conversational spoken English/Hinglish."""
    if not text:
        return ""

    s = text

    # Strip display math delimiters $$...$$ and inline $...$
    # We will process contents
    def replace_math_chunk(match):
        chunk = match.group(1)

        # Common science/CBSE formulas
        # Mirror formula: 1/v + 1/u = 1/f
        chunk = re.sub(r"\\frac\{1\}\{v\}\s*\+\s*\\frac\{1\}\{u\}\s*=\s*\\frac\{1\}\{f\}", "one over v plus one over u equals one over f", chunk)
        # Lens formula: 1/v - 1/u = 1/f
        chunk = re.sub(r"\\frac\{1\}\{v\}\s*-\s*\\frac\{1\}\{u\}\s*=\s*\\frac\{1\}\{f\}", "one over v minus one over u equals one over f", chunk)
        # Magnification: m = -v/u or h'/h
        chunk = re.sub(r"m\s*=\s*-\\frac\{v\}\{u\}", "m equals minus v over u", chunk)
        chunk = re.sub(r"m\s*=\s*\\frac\{v\}\{u\}", "m equals v over u", chunk)
        chunk = re.sub(r"m\s*=\s*\\frac\{h[']?\}\{h\}", "m equals h prime over h", chunk)
        # Ohm's law: V = IR
        chunk = re.sub(r"V\s*=\s*I\s*R", "V equals I times R", chunk)
        # Snell's Law: n = sin i / sin r
        chunk = re.sub(r"\\frac\{\\sin\s*i\}\{\\sin\s*r\}", "sine of i over sine of r", chunk)

        # Units
        for unit_pat, unit_spoken in UNITS.items():
            chunk = chunk.replace(unit_pat, unit_spoken)

        # Fractions: \frac{num}{den} -> num over den
        # Recursively handle fractions
        for _ in range(3):
            chunk = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"\1 over \2", chunk)

        # Square roots: \sqrt{x} -> square root of x
        chunk = re.sub(r"\\sqrt\{([^{}]+)\}", r"square root of \1", chunk)
        chunk = re.sub(r"\\sqrt\[([^{}]+)\]\{([^{}]+)\}", r"\1-th root of \2", chunk)

        # Powers: x^2 -> x squared, x^3 -> x cubed, x^n -> x to the power of n
        chunk = re.sub(r"([a-zA-Z0-9\)\}]+)\^2\b", r"\1 squared", chunk)
        chunk = re.sub(r"([a-zA-Z0-9\)\}]+)\^3\b", r"\1 cubed", chunk)
        chunk = re.sub(r"([a-zA-Z0-9\)\}]+)\^\{2\}", r"\1 squared", chunk)
        chunk = re.sub(r"([a-zA-Z0-9\)\}]+)\^\{3\}", r"\1 cubed", chunk)
        chunk = re.sub(r"([a-zA-Z0-9\)\}]+)\^\{([^{}]+)\}", r"\1 to the power of \2", chunk)
        chunk = re.sub(r"([a-zA-Z0-9\)\}]+)\^([a-zA-Z0-9])", r"\1 to the power of \2", chunk)

        # Subscripts: x_1 -> x 1, v_i -> v i
        chunk = re.sub(r"_\{([^{}]+)\}", r" sub \1", chunk)
        chunk = re.sub(r"_([a-zA-Z0-9])", r" sub \1", chunk)

        # Greek letters
        for pat, val in GREEK_LETTERS.items():
            chunk = re.sub(re.escape(pat) + r"(?![a-zA-Z])", val, chunk)

        # Symbols & Operators
        for pat, val in SYMBOLS.items():
            chunk = chunk.replace(pat, val)

        # Text wrappers: \text{abc} -> abc
        chunk = re.sub(r"\\text\{([^{}]+)\}", r"\1", chunk)
        chunk = re.sub(r"\\mathrm\{([^{}]+)\}", r"\1", chunk)
        chunk = re.sub(r"\\mathbf\{([^{}]+)\}", r"\1", chunk)

        # Trig functions
        chunk = re.sub(r"\\sin\b", "sine", chunk)
        chunk = re.sub(r"\\cos\b", "cosine", chunk)
        chunk = re.sub(r"\\tan\b", "tangent", chunk)
        chunk = re.sub(r"\\log\b", "log", chunk)

        # Clean up backslashes and extra spaces
        chunk = chunk.replace("\\", "")
        chunk = re.sub(r"\s+", " ", chunk).strip()
        return chunk

    # Replace block math $$...$$
    s = re.sub(r"\$\$(.*?)\$\$", replace_math_chunk, s, flags=re.DOTALL)
    # Replace inline math $...$
    s = re.sub(r"\$(.*?)\$", replace_math_chunk, s)

    # General cleanup
    s = re.sub(r"\s+", " ", s).strip()
    return s
