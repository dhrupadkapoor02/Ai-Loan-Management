import { body, param } from "express-validator";

export const createExpenseValidator = [
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("date").isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("categoryId").optional().isUUID().withMessage("Invalid category id"),
  body("paymentMethod").optional().trim().isLength({ max: 50 }),
  body("description").optional().trim().isLength({ max: 500 }),
];

export const updateExpenseValidator = [
  param("id").isUUID().withMessage("Invalid expense id"),
  body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("categoryId").optional({ nullable: true }).isUUID().withMessage("Invalid category id"),
  body("paymentMethod").optional().trim().isLength({ max: 50 }),
  body("description").optional().trim().isLength({ max: 500 }),
];
