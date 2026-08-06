import { body, param, query } from "express-validator";
import { LOAN_TYPES } from "./loan.validator.js";

export const submitLoanApplicationValidator = [
  body("type").isIn(LOAN_TYPES).withMessage(`type must be one of: ${LOAN_TYPES.join(", ")}`),
  body("amountRequested").isFloat({ gt: 0 }).withMessage("Amount requested must be a positive number"),
  body("interestRate").isFloat({ min: 0, max: 50 }).withMessage("Interest rate must be between 0 and 50"),
  body("tenureMonths").isInt({ min: 1, max: 480 }).withMessage("Tenure must be between 1 and 480 months"),
  body("purpose").optional().trim().isLength({ max: 500 }),
  body("loanId").optional().isUUID().withMessage("Invalid loanId"),
];

export const applicationIdParamValidator = [param("id").isUUID().withMessage("Invalid application id")];

export const listApplicationsValidator = [
  query("status")
    .optional()
    .isIn(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"])
    .withMessage("Invalid status filter"),
];
