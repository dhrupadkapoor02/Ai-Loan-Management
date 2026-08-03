import { Router } from "express";
import * as incomeController from "../controllers/income.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createIncomeValidator, updateIncomeValidator } from "../validators/income.validator.js";
import { idParamValidator, listQueryValidator } from "../validators/common.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listQueryValidator, validate, incomeController.listIncomes);
router.post("/", createIncomeValidator, validate, incomeController.createIncome);
router.patch("/:id", updateIncomeValidator, validate, incomeController.updateIncome);
router.delete("/:id", idParamValidator, validate, incomeController.deleteIncome);

export default router;
