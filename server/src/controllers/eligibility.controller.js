import asyncHandler from "express-async-handler";
import * as eligibilityService from "../services/eligibility.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const checkEligibility = asyncHandler(async (req, res) => {
  const result = await eligibilityService.checkEligibility(req.user.id, req.body);
  return sendSuccess(res, { message: "Eligibility checked", data: result });
});
