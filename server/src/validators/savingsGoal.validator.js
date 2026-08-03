import { body, param } from "express-validator";

export const createSavingsGoalValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }),
  body("targetAmount").isFloat({ gt: 0 }).withMessage("Target amount must be a positive number"),
  body("targetDate").optional({ nullable: true }).isISO8601().withMessage("targetDate must be a valid date"),
];

export const updateSavingsGoalValidator = [
  param("id").isUUID().withMessage("Invalid savings goal id"),
  body("title").optional().trim().notEmpty().isLength({ max: 100 }),
  body("targetAmount").optional().isFloat({ gt: 0 }).withMessage("Target amount must be a positive number"),
  body("targetDate").optional({ nullable: true }).isISO8601().withMessage("targetDate must be a valid date"),
];

export const contributeValidator = [
  param("id").isUUID().withMessage("Invalid savings goal id"),
  body("amount").isFloat({ gt: 0 }).withMessage("Contribution amount must be a positive number"),
];

export const savingsGoalIdParamValidator = [param("id").isUUID().withMessage("Invalid savings goal id")];
