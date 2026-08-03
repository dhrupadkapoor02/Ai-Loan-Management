import asyncHandler from "express-async-handler";
import * as transactionService from "../services/transaction.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { parsePagination } from "../utils/pagination.js";

export const listTransactions = asyncHandler(async (req, res) => {
  const { type, categoryId, startDate, endDate } = req.query;
  const filters = {
    type,
    categoryId,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  };
  const { items, meta } = await transactionService.listTransactions(
    req.user.id,
    filters,
    parsePagination(req.query)
  );
  return sendSuccess(res, { message: "Transactions fetched", data: { transactions: items }, meta });
});
