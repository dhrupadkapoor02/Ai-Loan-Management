import { body, param, query } from "express-validator";

export const listCategoriesValidator = [
  query("type").isIn(["INCOME", "EXPENSE"]).withMessage("type must be INCOME or EXPENSE"),
];

export const createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("type").isIn(["INCOME", "EXPENSE"]).withMessage("type must be INCOME or EXPENSE"),
  body("icon").optional().trim().isLength({ max: 50 }),
];

export const updateCategoryValidator = [
  param("id").isUUID().withMessage("Invalid category id"),
  body("name").optional().trim().notEmpty().isLength({ max: 50 }),
  body("icon").optional().trim().isLength({ max: 50 }),
];

export const categoryIdParamValidator = [param("id").isUUID().withMessage("Invalid category id")];
