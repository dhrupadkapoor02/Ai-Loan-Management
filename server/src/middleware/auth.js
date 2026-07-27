import asyncHandler from "express-async-handler";
import { verifyAccessToken } from "../utils/jwt.js";
import { findUserPublicById } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Verifies the `Authorization: Bearer <accessToken>` header, loads the
 * current user, and attaches it to `req.user`. Mount on any route that
 * requires a signed-in user.
 *
 * Re-fetching the user (instead of trusting the JWT payload alone) means a
 * deactivated account is rejected immediately rather than staying valid
 * until the access token naturally expires.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authentication required");
  }

  const token = header.slice("Bearer ".length);
  const payload = verifyAccessToken(token);

  const user = await findUserPublicById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (!user.isActive) throw ApiError.forbidden("This account has been deactivated");

  req.user = user;
  next();
});

/**
 * Role gate — use after `authenticate`:
 *   router.get("/admin/stats", authenticate, authorize("ADMIN"), handler);
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
