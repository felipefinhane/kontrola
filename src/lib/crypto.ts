import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Field-level encryption for free-text Transaction fields (description,
 * note) — see ADR-0003. Server-managed key (FIELD_ENCRYPTION_KEY env var),
 * not derived from the user's password: protects against a DB dump leak
 * without risking permanent data loss if a password is forgotten, and
 * keeps server-side automation (recurring-template generation, inactivity
 * reminders) able to read transaction content.
 *
 * Deliberately NOT used for `amount` — see ADR-0003 for why (SUM/GROUP BY
 * need to keep working directly in Postgres for Balance and reports).
 *
 * Format: base64(iv) + "." + base64(authTag) + "." + base64(ciphertext).
 * AES-256-GCM: authenticated, so tampering with any part fails to decrypt
 * rather than silently returning garbage.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM

function getKey(): Buffer {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY is not set — see .env.example. Generate one with: openssl rand -base64 32",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `FIELD_ENCRYPTION_KEY must decode to exactly 32 bytes for AES-256 (got ${key.length}). Generate one with: openssl rand -base64 32`,
    );
  }
  return key;
}

export function encryptField(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${ciphertext.toString("base64")}`;
}

export function decryptField(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(".");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error("Malformed encrypted field value");
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
