import rateLimit from "express-rate-limit";

/**
 * Sensitive auth endpoints get a much tighter limit than the global API
 * limiter, since they're the highest-value targets for brute-force and
 * credential-stuffing attacks. Keyed by IP (express-rate-limit default).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

/** Even tighter limit for password-reset requests to prevent email bombing. */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});
