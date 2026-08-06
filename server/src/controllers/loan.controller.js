import asyncHandler from "express-async-handler";
import * as loanService from "../services/loan.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const calculateEmi = asyncHandler(async (req, res) => {
  const result = loanService.calculate(req.body);
  return sendSuccess(res, { message: "EMI calculated", data: result });
});

export const saveLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.saveLoan(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Loan saved", data: { loan } });
});

export const listLoans = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filters = isActive !== undefined ? { isActive: isActive === "true" } : {};
  const loans = await loanService.listLoans(req.user.id, filters);
  return sendSuccess(res, { message: "Loans fetched", data: { loans } });
});

export const updateLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.updateLoan(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: "Loan updated", data: { loan } });
});

export const deleteLoan = asyncHandler(async (req, res) => {
  await loanService.deleteLoan(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Loan deleted" });
});

export const compareLoans = asyncHandler(async (req, res) => {
  const comparison = loanService.compareLoans(req.body.offers);
  return sendSuccess(res, { message: "Loans compared", data: { comparison } });
});
