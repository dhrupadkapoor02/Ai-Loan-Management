import { Router } from "express";
import * as loanController from "../controllers/loan.controller.js";
import * as eligibilityController from "../controllers/eligibility.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  calculateEmiValidator,
  saveLoanValidator,
  updateLoanValidator,
  loanIdParamValidator,
  compareLoansValidator,
  eligibilityValidator,
} from "../validators/loan.validator.js";

const router = Router();

router.use(authenticate);

router.post("/calculate-emi", calculateEmiValidator, validate, loanController.calculateEmi);
router.post("/compare", compareLoansValidator, validate, loanController.compareLoans);
router.post("/check-eligibility", eligibilityValidator, validate, eligibilityController.checkEligibility);

router.get("/", loanController.listLoans);
router.post("/", saveLoanValidator, validate, loanController.saveLoan);
router.patch("/:id", updateLoanValidator, validate, loanController.updateLoan);
router.delete("/:id", loanIdParamValidator, validate, loanController.deleteLoan);

export default router;
