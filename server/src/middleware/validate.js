import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Drop this after any array of express-validator chains:
 *   router.post("/register", registerValidator, validate, register);
 *
 * Collects all validation failures into a single 400 response instead of
 * failing on the first one, so the client can show every field error at
 * once.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  throw ApiError.badRequest("Validation failed", details);
}
