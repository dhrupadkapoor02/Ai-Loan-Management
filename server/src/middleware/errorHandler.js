import { isProduction } from "../config/env.js";

/**
 * 404 handler — mounted after all routes. Anything that falls through
 * every route becomes a well-formed 404 instead of Express's default HTML
 * error page.
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Centralized error handler — the single place that turns any thrown
 * error (ApiError or otherwise) into a JSON response.
 *
 * Must be registered LAST, after all routes and other middleware, and must
 * keep all four arguments (err, req, res, next) for Express to recognize it
 * as an error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isOperational = err.isOperational === true;
  const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // Log full detail server-side always; only expose safe detail to clients.
  if (!isOperational) {
    // eslint-disable-next-line no-console
    console.error("[unhandled error]", err);
  }

  const message = isOperational || !isProduction ? err.message : "Internal Server Error";

  const body = { success: false, message };

  if (err.details) body.errors = err.details;
  if (!isProduction && !isOperational) body.stack = err.stack;

  res.status(statusCode).json(body);
}
