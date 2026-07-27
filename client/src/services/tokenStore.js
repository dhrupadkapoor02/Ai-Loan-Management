/**
 * The access token lives in memory only — never localStorage/sessionStorage
 * — so it can't be read by an injected script via XSS. It's lost on a hard
 * page refresh, which is expected: AuthProvider silently calls
 * /auth/refresh-token on mount (using the HttpOnly cookie) to restore it.
 */
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}
