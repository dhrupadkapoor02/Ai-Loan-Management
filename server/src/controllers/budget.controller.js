import asyncHandler from "express-async-handler";
import * as budgetService from "../services/budget.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { currentMonthYear } from "../utils/dateRange.js";

export const setBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.setBudget(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Budget saved", data: { budget } });
});

export const listBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query.month && req.query.year
    ? { month: Number(req.query.month), year: Number(req.query.year) }
    : currentMonthYear();

  const budgets = await budgetService.listBudgets(req.user.id, { month, year });
  return sendSuccess(res, { message: "Budgets fetched", data: { budgets, month, year } });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  await budgetService.deleteBudget(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Budget deleted" });
});
