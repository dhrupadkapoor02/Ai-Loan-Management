import { param, query } from "express-validator";

export const idParamValidator = [param("id").isUUID().withMessage("Invalid id")];

export const listQueryValidator = [
  query("categoryId").optional().isUUID(),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];
