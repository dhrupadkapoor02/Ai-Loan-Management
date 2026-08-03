import asyncHandler from "express-async-handler";
import * as incomeService from "../services/income.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

export const createIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.createIncome(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Income recorded", data: { income } });
});

export const listIncomes = asyncHandler(async (req, res) => {
  const { categoryId, startDate, endDate } = req.query;
  const filters = {
    categoryId,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  };
  const { items, meta } = await incomeService.listIncomes(req.user.id, filters, parsePagination(req.query));
  return sendSuccess(res, { message: "Incomes fetched", data: { incomes: items }, meta });
});

export const updateIncome = asyncHandler(async (req, res) => {
  const income = await incomeService.updateIncome(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: "Income updated", data: { income } });
});

export const deleteIncome = asyncHandler(async (req, res) => {
  await incomeService.deleteIncome(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Income deleted" });
});
