import { Router } from "express";
import * as budgetController from "../controllers/budget.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  upsertBudgetValidator,
  monthYearQueryValidator,
  budgetIdParamValidator,
} from "../validators/budget.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", monthYearQueryValidator, validate, budgetController.listBudgets);
router.post("/", upsertBudgetValidator, validate, budgetController.setBudget);
router.delete("/:id", budgetIdParamValidator, validate, budgetController.deleteBudget);

export default router;
