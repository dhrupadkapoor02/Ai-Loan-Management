import { body, param, query } from "express-validator";

export const upsertBudgetValidator = [
  body("categoryId").isUUID().withMessage("A valid categoryId is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be between 1 and 12"),
  body("year").isInt({ min: 2000, max: 2100 }).withMessage("Year is out of range"),
];

export const monthYearQueryValidator = [
  query("month").optional().isInt({ min: 1, max: 12 }),
  query("year").optional().isInt({ min: 2000, max: 2100 }),
];

export const budgetIdParamValidator = [param("id").isUUID().withMessage("Invalid budget id")];
