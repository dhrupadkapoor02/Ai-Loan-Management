import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { dashboardQueryValidator } from "../validators/dashboard.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", dashboardQueryValidator, validate, dashboardController.getDashboard);

export default router;
