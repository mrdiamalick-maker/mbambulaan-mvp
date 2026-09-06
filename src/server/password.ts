import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Hachage de mot de passe auto-suffisant (aucune dépendance externe type
// argon2/bcrypt) : scrypt est fourni nativement par Node et suffit pour le
// volume de comptes attendu (équipes Mbàmbulaan, ministère, partenaires —
// pas un grand public). Format stocké : scrypt:N:r:p:sel:hash (tout en hex).

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }) => Promise<Buffer>;

const N = 16384;
const r = 8;
const p = 1;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scryptAsync(password, salt, expected.length, {
    N: Number(nStr),
    r: Number(rStr),
    p: Number(pStr)
  });
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function isPasswordStrongEnough(password: string): boolean {
  return typeof password === "string" && password.length >= 10;
}
