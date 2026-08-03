import asyncHandler from "express-async-handler";
import * as expenseService from "../services/expense.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Expense recorded", data: { expense } });
});

export const listExpenses = asyncHandler(async (req, res) => {
  const { categoryId, startDate, endDate } = req.query;
  const filters = {
    categoryId,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  };
  const { items, meta } = await expenseService.listExpenses(req.user.id, filters, parsePagination(req.query));
  return sendSuccess(res, { message: "Expenses fetched", data: { expenses: items }, meta });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: "Expense updated", data: { expense } });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Expense deleted" });
});
