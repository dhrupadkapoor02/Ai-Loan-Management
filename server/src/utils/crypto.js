import crypto from "node:crypto";

/**
 * One-time tokens (email verification, password reset) follow the standard
 * "send raw, store hashed" pattern:
 *   1. Generate a random raw token.
 *   2. Email the RAW token to the user (in a link).
 *   3. Store only the SHA-256 HASH of it in the database.
 *   4. When the user clicks the link, hash what they present and compare
 *      against the stored hash.
 *
 * This means a database leak alone never exposes usable verification/reset
 * tokens, the same principle applied to refresh tokens.
 */

export function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
