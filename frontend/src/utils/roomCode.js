/**
 * 6-character room code utility using unambiguous alphabet (no O, 0, I, 1).
 */
export const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    code += ALPHABET[randomIndex];
  }
  return code;
}

export function validateRoomCode(code) {
  if (!code || typeof code !== "string") return false;
  const clean = code.trim().toUpperCase();
  if (clean.length !== 6) return false;
  for (const ch of clean) {
    if (!ALPHABET.includes(ch)) return false;
  }
  return true;
}
