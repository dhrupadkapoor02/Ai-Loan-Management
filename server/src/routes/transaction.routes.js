import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listTransactionsValidator } from "../validators/transaction.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listTransactionsValidator, validate, transactionController.listTransactions);

export default router;
