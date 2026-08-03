import { query } from "express-validator";

export const dashboardQueryValidator = [
  query("month").optional().isInt({ min: 1, max: 12 }),
  query("year").optional().isInt({ min: 2000, max: 2100 }),
];
