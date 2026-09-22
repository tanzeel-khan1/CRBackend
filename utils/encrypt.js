const crypto = require('crypto');

const KEY_ENV = 'PASSWORD_VAULT_KEY';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

let derivedKey = null;

function getKey() {
  if (derivedKey) return derivedKey;

  const secret = process.env.PASSWORD_VAULT_KEY;
  if (!secret) {
    // Fallback for legacy/local setups: derive a key from JWT_SECRET so the
    // vault still works, but warn loudly. Set PASSWORD_VAULT_KEY in production.
    const fallback = process.env.JWT_SECRET || 'dev-only-insecure-key-change-me';
    console.warn(
      '[encrypt] PASSWORD_VAULT_KEY is not set; deriving encryption key from JWT_SECRET. Set PASSWORD_VAULT_KEY in production.'
    );
    derivedKey = crypto.createHash('sha256').update(fallback).digest();
    return derivedKey;
  }

  derivedKey = crypto.createHash('sha256').update(secret).digest();
  return derivedKey;
}

/**
 * Encrypts plaintext to `iv:authTag:ciphertext` (hex).
 * Returns null for empty input.
 */
function encrypt(text) {
  if (text === undefined || text === null || text === '') return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts the `iv:authTag:ciphertext` (hex) format back to plaintext.
 * Legacy plaintext values are returned unchanged so existing rows keep working.
 */
function decrypt(value) {
  if (value === undefined || value === null || value === '') return value;
  const parts = String(value).split(':');
  if (parts.length !== 3) return value; // stored as plaintext (legacy row)
  try {
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('[encrypt] decrypt failed:', error.message);
    return value;
  }
}

module.exports = { encrypt, decrypt };