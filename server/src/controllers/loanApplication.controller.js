import asyncHandler from "express-async-handler";
import * as loanApplicationService from "../services/loanApplication.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const submitApplication = asyncHandler(async (req, res) => {
  const application = await loanApplicationService.submitApplication(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Loan application submitted", data: { application } });
});

export const listApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const applications = await loanApplicationService.listApplications(req.user.id, status ? { status } : {});
  return sendSuccess(res, { message: "Loan applications fetched", data: { applications } });
});

export const getApplication = asyncHandler(async (req, res) => {
  const application = await loanApplicationService.getApplication(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Loan application fetched", data: { application } });
});

export const cancelApplication = asyncHandler(async (req, res) => {
  const application = await loanApplicationService.cancelApplication(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Loan application cancelled", data: { application } });
});
