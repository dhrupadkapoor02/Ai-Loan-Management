import { Router } from "express";
import * as expenseController from "../controllers/expense.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createExpenseValidator, updateExpenseValidator } from "../validators/expense.validator.js";
import { idParamValidator, listQueryValidator } from "../validators/common.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listQueryValidator, validate, expenseController.listExpenses);
router.post("/", createExpenseValidator, validate, expenseController.createExpense);
router.patch("/:id", updateExpenseValidator, validate, expenseController.updateExpense);
router.delete("/:id", idParamValidator, validate, expenseController.deleteExpense);

export default router;
