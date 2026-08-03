import asyncHandler from "express-async-handler";
import * as savingsGoalService from "../services/savingsGoal.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createSavingsGoal = asyncHandler(async (req, res) => {
  const goal = await savingsGoalService.createSavingsGoal(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: "Savings goal created", data: { goal } });
});

export const listSavingsGoals = asyncHandler(async (req, res) => {
  const goals = await savingsGoalService.listSavingsGoals(req.user.id);
  return sendSuccess(res, { message: "Savings goals fetched", data: { goals } });
});

export const updateSavingsGoal = asyncHandler(async (req, res) => {
  const goal = await savingsGoalService.updateSavingsGoal(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: "Savings goal updated", data: { goal } });
});

export const deleteSavingsGoal = asyncHandler(async (req, res) => {
  await savingsGoalService.deleteSavingsGoal(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Savings goal deleted" });
});

export const contribute = asyncHandler(async (req, res) => {
  const goal = await savingsGoalService.contribute(req.user.id, req.params.id, req.body.amount);
  return sendSuccess(res, { message: "Contribution added", data: { goal } });
});
