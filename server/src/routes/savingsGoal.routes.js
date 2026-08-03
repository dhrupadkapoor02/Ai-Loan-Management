import { Router } from "express";
import * as savingsGoalController from "../controllers/savingsGoal.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createSavingsGoalValidator,
  updateSavingsGoalValidator,
  contributeValidator,
  savingsGoalIdParamValidator,
} from "../validators/savingsGoal.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", savingsGoalController.listSavingsGoals);
router.post("/", createSavingsGoalValidator, validate, savingsGoalController.createSavingsGoal);
router.patch("/:id", updateSavingsGoalValidator, validate, savingsGoalController.updateSavingsGoal);
router.delete("/:id", savingsGoalIdParamValidator, validate, savingsGoalController.deleteSavingsGoal);
router.post("/:id/contribute", contributeValidator, validate, savingsGoalController.contribute);

export default router;
