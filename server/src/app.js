import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env, isDevelopment } from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

// Render (and most PaaS hosts) sit behind a reverse proxy that terminates
// TLS. Without this, req.ip and req.secure would reflect the proxy, not the
// real client, which breaks rate limiting and the `secure` cookie flag.
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// Security & parsing middleware
// ---------------------------------------------------------------------------

// Sets a battery of security-related HTTP headers (CSP, X-Frame-Options,
// HSTS, etc.). Defaults are sane for an API-only server.
app.use(helmet());

// Only allow the configured frontend origin, and allow cookies to be sent
// cross-origin (needed for the HttpOnly refresh-token cookie in Module 2).
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Request logging: concise in prod, verbose ("dev") locally.
app.use(morgan(isDevelopment ? "dev" : "combined"));

// Parse JSON and urlencoded bodies.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Parse cookies (needed to read the HttpOnly refresh token cookie later).
app.use(cookieParser());

// Global rate limiter — protects every route from brute-force / abuse.
// Auth-sensitive routes (login, register, password reset) get a stricter,
// route-specific limiter layered on top in Module 2.
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  })
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI-Powered Finance & Loan Management System API",
  });
});

app.use("/api", routes);

// ---------------------------------------------------------------------------
// Error handling (must be last)
// ---------------------------------------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
