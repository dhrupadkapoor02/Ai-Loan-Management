import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiters.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  changePasswordValidator,
  updateProfileValidator,
} from "../validators/auth.validator.js";

const router = Router();

// -- Public ------------------------------------------------------------
router.post("/register", authLimiter, registerValidator, validate, authController.register);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

router.get("/verify-email/:token", verifyEmailValidator, validate, authController.verifyEmail);
router.post(
  "/resend-verification",
  authLimiter,
  resendVerificationValidator,
  validate,
  authController.resendVerification
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword
);

// -- Authenticated -------------------------------------------------------
router.get("/me", authenticate, authController.getMe);
router.patch("/profile", authenticate, updateProfileValidator, validate, authController.updateProfile);
router.patch(
  "/change-password",
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);
router.post("/logout-all", authenticate, authController.logoutAllDevices);

export default router;
