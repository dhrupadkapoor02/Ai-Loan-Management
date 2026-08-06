import { body, param } from "express-validator";

const LOAN_TYPES = ["PERSONAL", "HOME", "AUTO", "EDUCATION", "BUSINESS", "OTHER"];

export const calculateEmiValidator = [
  body("principal").isFloat({ gt: 0 }).withMessage("Principal must be a positive number"),
  body("interestRate").isFloat({ min: 0, max: 50 }).withMessage("Interest rate must be between 0 and 50"),
  body("tenureMonths").isInt({ min: 1, max: 480 }).withMessage("Tenure must be between 1 and 480 months"),
];

export const saveLoanValidator = [
  body("type").isIn(LOAN_TYPES).withMessage(`type must be one of: ${LOAN_TYPES.join(", ")}`),
  body("principal").isFloat({ gt: 0 }).withMessage("Principal must be a positive number"),
  body("interestRate").isFloat({ min: 0, max: 50 }).withMessage("Interest rate must be between 0 and 50"),
  body("tenureMonths").isInt({ min: 1, max: 480 }).withMessage("Tenure must be between 1 and 480 months"),
  body("name").optional().trim().isLength({ max: 100 }),
  body("lender").optional().trim().isLength({ max: 100 }),
  body("notes").optional().trim().isLength({ max: 500 }),
];

export const updateLoanValidator = [
  param("id").isUUID().withMessage("Invalid loan id"),
  body("name").optional().trim().isLength({ max: 100 }),
  body("lender").optional().trim().isLength({ max: 100 }),
  body("notes").optional().trim().isLength({ max: 500 }),
  body("isActive").optional().isBoolean(),
];

export const loanIdParamValidator = [param("id").isUUID().withMessage("Invalid loan id")];

export const compareLoansValidator = [
  body("offers").isArray({ min: 2, max: 5 }).withMessage("Provide between 2 and 5 offers to compare"),
  body("offers.*.label").optional().trim().isLength({ max: 50 }),
  body("offers.*.principal").isFloat({ gt: 0 }).withMessage("Each offer needs a positive principal"),
  body("offers.*.interestRate").isFloat({ min: 0, max: 50 }).withMessage("Each offer needs a valid interest rate"),
  body("offers.*.tenureMonths").isInt({ min: 1, max: 480 }).withMessage("Each offer needs a valid tenure"),
];

export const eligibilityValidator = [
  body("requestedAmount").isFloat({ gt: 0 }).withMessage("Requested amount must be a positive number"),
  body("interestRate").isFloat({ min: 0, max: 50 }).withMessage("Interest rate must be between 0 and 50"),
  body("tenureMonths").isInt({ min: 1, max: 480 }).withMessage("Tenure must be between 1 and 480 months"),
];

export { LOAN_TYPES };
