import { body, param } from "express-validator";

const amountRule = body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number");
const dateRule = body("date").isISO8601().withMessage("Date must be a valid ISO 8601 date");

export const createIncomeValidator = [
  amountRule,
  dateRule,
  body("categoryId").optional().isUUID().withMessage("Invalid category id"),
  body("source").optional().trim().isLength({ max: 100 }),
  body("description").optional().trim().isLength({ max: 500 }),
];

export const updateIncomeValidator = [
  param("id").isUUID().withMessage("Invalid income id"),
  body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("categoryId").optional({ nullable: true }).isUUID().withMessage("Invalid category id"),
  body("source").optional().trim().isLength({ max: 100 }),
  body("description").optional().trim().isLength({ max: 500 }),
];
