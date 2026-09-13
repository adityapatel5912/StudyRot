"""
Cryptographic utility module providing AES-256-GCM encryption and decryption
for user API keys stored at rest, derived from SUPABASE_SERVICE_ROLE_KEY.
"""

import os
import base64
import hashlib
from typing import Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from config import SUPABASE_SERVICE_ROLE_KEY

# Fixed salt for key derivation if secret is present; default internal salt for local dev
SALT = b"studyrot-aes256-gcm-key-derivation-v1"


def _derive_key(master_secret: Optional[str] = None) -> bytes:
    """Derives a deterministic 32-byte (256-bit) AES key using SHA-256."""
    secret = (master_secret or SUPABASE_SERVICE_ROLE_KEY or "studyrot-default-internal-master-key-salt").encode("utf-8")
    return hashlib.sha256(secret + SALT).digest()


def encrypt_api_key(plaintext: str, master_secret: Optional[str] = None) -> str:
    """
    Encrypts plaintext string using AES-256-GCM.
    Returns base64-encoded string containing 12-byte nonce prepended to ciphertext.
    """
    if not plaintext:
        return ""
    key = _derive_key(master_secret)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    return base64.b64encode(nonce + ciphertext).decode("utf-8")


def decrypt_api_key(encrypted_b64: str, master_secret: Optional[str] = None) -> str:
    """
    Decrypts base64-encoded AES-256-GCM ciphertext back to plaintext.
    Returns decrypted string, or empty string on failure.
    """
    if not encrypted_b64:
        return ""
    try:
        raw = base64.b64decode(encrypted_b64.encode("utf-8"))
        if len(raw) < 12:
            return ""
        nonce = raw[:12]
        ciphertext = raw[12:]
        key = _derive_key(master_secret)
        aesgcm = AESGCM(key)
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode("utf-8")
    except Exception:
        return ""
