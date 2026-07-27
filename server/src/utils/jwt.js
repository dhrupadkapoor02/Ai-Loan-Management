import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

/**
 * Access tokens are short-lived, stateless JWTs carrying just enough claims
 * to authorize a request (`sub`, `role`) without hitting the database on
 * every call. Refresh tokens are long-lived JWTs whose *sole* job is to
 * prove "this raw string was issued by us for this user" — the actual
 * session state (revoked / rotated / expired) lives in the RefreshToken
 * table, not in the JWT itself. That's what lets us revoke a refresh token
 * before its natural expiry.
 */

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw ApiError.unauthorized("Access token is invalid or has expired");
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized("Refresh token is invalid or has expired");
  }
}

/**
 * Converts a JWT "expiresIn" style string/number (e.g. "7d", "15m", 900)
 * into an absolute Date, so we can store `expiresAt` alongside the hashed
 * refresh token in the database.
 */
export function expiresInToDate(expiresIn) {
  const ms = typeof expiresIn === "number" ? expiresIn * 1000 : parseDuration(expiresIn);
  return new Date(Date.now() + ms);
}

function parseDuration(value) {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(String(value).trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${value}"`);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * unitMs[unit];
}
