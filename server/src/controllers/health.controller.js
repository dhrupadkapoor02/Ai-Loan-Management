import asyncHandler from "express-async-handler";
import { getHealthStatus } from "../services/health.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

/**
 * GET /api/health
 * Public endpoint used for uptime checks / load balancer health probes.
 */
export const healthCheck = asyncHandler(async (req, res) => {
  const health = await getHealthStatus();

  return sendSuccess(res, {
    statusCode: health.status === "ok" ? 200 : 503,
    message: "Health check completed",
    data: health,
  });
});
