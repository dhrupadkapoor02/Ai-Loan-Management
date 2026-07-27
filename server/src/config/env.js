import "dotenv/config";

/**
 * Centralized environment configuration.
 *
 * Why this exists instead of scattering `process.env.X` across the codebase:
 *  - Single source of truth for every env var the app depends on.
 *  - Fails fast at boot (not mid-request) if something required is missing.
 *  - Lets us cast/parse values (numbers, booleans) once, in one place.
 *
 * Required vars are grouped by the module that introduces them. Module 1
 * only needs the first group; later modules will extend `requiredInAll`
 * as new features (mail, AI, etc.) come online.
 */

const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Fail fast and loud — a misconfigured server should never boot silently.
  // eslint-disable-next-line no-console
  console.error(
    `[env] Missing required environment variable(s): ${missing.join(", ")}\n` +
      `Copy server/.env.example to server/.env and fill in the values.`
  );
  process.exit(1);
}

if (
  process.env.NODE_ENV === "production" &&
  (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32)
) {
  // eslint-disable-next-line no-console
  console.error(
    "[env] JWT_ACCESS_SECRET / JWT_REFRESH_SECRET look too short for production. " +
      "Use at least 32 random characters (e.g. `openssl rand -hex 32`)."
  );
  process.exit(1);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // CORS
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // JWT (introduced fully in Module 2 — declared here so env.js stays the
  // single place every future module reads config from)
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Mail (Module 8)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "no-reply@example.com",

  // AI (Module 7)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
};

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
