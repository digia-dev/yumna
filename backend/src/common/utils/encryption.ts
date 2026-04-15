// 423 – Field-level AES-256-GCM Encryption for sensitive data
// Usage: encrypt(plainText) → storedValue,  decrypt(storedValue) → plainText

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM  = 'aes-256-gcm';
const IV_LENGTH  = 12;   // 96-bit nonce for GCM
const TAG_LENGTH = 16;   // 128-bit auth tag
const SALT       = 'yumna_field_encryption_v1'; // Fixed salt — key set via env

function deriveKey(): Buffer {
  const secret = process.env.FIELD_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error(
      'FIELD_ENCRYPTION_KEY env var is required and must be ≥32 chars. ' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  // Derive a 256-bit key from the passphrase via scrypt (memory-hard KDF)
  return scryptSync(secret, SALT, 32);
}

/**
 * Encrypt a string value for storage.
 * Output format: base64(iv:tag:ciphertext)
 */
export function encrypt(plainText: string | null | undefined): string | null {
  if (plainText === null || plainText === undefined) return null;
  const key  = deriveKey();
  const iv   = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Pack: [iv (12)] + [tag (16)] + [ciphertext]
  const payload = Buffer.concat([iv, tag, encrypted]);
  return payload.toString('base64');
}

/**
 * Decrypt a field value produced by encrypt().
 */
export function decrypt(encryptedValue: string | null | undefined): string | null {
  if (!encryptedValue) return null;
  const key     = deriveKey();
  const payload = Buffer.from(encryptedValue, 'base64');
  const iv      = payload.subarray(0, IV_LENGTH);
  const tag     = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = payload.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Encrypt a numeric value (e.g. wallet balance) stored as string.
 */
export function encryptNumber(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return encrypt(value.toString());
}

/**
 * Decrypt a numeric string back to number.
 */
export function decryptNumber(encryptedValue: string | null | undefined): number | null {
  const raw = decrypt(encryptedValue);
  return raw === null ? null : parseFloat(raw);
}

/** Quick health-check: round-trips a test value */
export function selfTest(): boolean {
  try {
    const test = 'يُمنى_test_1234567890';
    return decrypt(encrypt(test)) === test;
  } catch {
    return false;
  }
}
