import secrets

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no O, 0, I, 1


def generate_short_code(length: int = 6) -> str:
    """Generates a secure, human-friendly 6-character short code without ambiguous characters."""
    return "".join(secrets.choice(ALPHABET) for _ in range(length))
