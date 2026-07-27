import { body, param } from "express-validator";

const passwordRules = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/[a-z]/)
  .withMessage("Password must contain a lowercase letter")
  .matches(/[A-Z]/)
  .withMessage("Password must contain an uppercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain a number");

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  passwordRules,
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
];

export const resetPasswordValidator = [
  param("token").notEmpty().withMessage("Reset token is required"),
  passwordRules,
];

export const verifyEmailValidator = [param("token").notEmpty().withMessage("Verification token is required")];

export const resendVerificationValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("New password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("New password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("New password must contain a number")
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage("New password must be different from the current password"),
];

export const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 100 }),
];
