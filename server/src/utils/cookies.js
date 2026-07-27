import { isProduction } from "../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * The refresh token lives only in an HttpOnly cookie — never in
 * localStorage or a JS-readable cookie — so it can't be exfiltrated via
 * XSS.
 *
 * SameSite policy differs by environment on purpose:
 *  - Dev: frontend (localhost:5173) and backend (localhost:5000) are
 *    different ports but the same registrable "site", so `lax` works and
 *    doesn't require HTTPS.
 *  - Prod: frontend (Vercel) and backend (Render) are on different domains,
 *    which is genuinely cross-site. `strict`/`lax` would silently stop the
 *    browser from ever sending the cookie, breaking refresh/logout. Only
 *    `none` (paired with `secure: true`, which browsers require) works
 *    cross-site.
 */
export function setRefreshTokenCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: expiresAt,
    path: "/api/auth", // only sent to auth endpoints that need it
  });
}

export function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
  });
}

export function getRefreshTokenFromCookies(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME] ?? null;
}

export { REFRESH_COOKIE_NAME };
