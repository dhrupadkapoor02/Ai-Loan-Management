/**
 * Consistent success response shape used across every endpoint:
 *
 *   {
 *     "success": true,
 *     "message": "Human readable summary",
 *     "data": { ... } | [ ... ] | null,
 *     "meta": { ... } | undefined   // pagination, counts, etc.
 *   }
 *
 * Error responses are shaped by the centralized error handler
 * (see middleware/errorHandler.js) so both paths stay consistent for the
 * frontend to consume.
 */
export function sendSuccess(res, { statusCode = 200, message = "Success", data = null, meta } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export default sendSuccess;
