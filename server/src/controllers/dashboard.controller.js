import asyncHandler from "express-async-handler";
import * as dashboardService from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { currentMonthYear } from "../utils/dateRange.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const { month, year } = req.query.month && req.query.year
    ? { month: Number(req.query.month), year: Number(req.query.year) }
    : currentMonthYear();

  const dashboard = await dashboardService.getDashboard(req.user.id, { month, year });
  return sendSuccess(res, { message: "Dashboard data fetched", data: dashboard });
});
