import { Router } from "express";
import * as loanApplicationController from "../controllers/loanApplication.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  submitLoanApplicationValidator,
  applicationIdParamValidator,
  listApplicationsValidator,
} from "../validators/loanApplication.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listApplicationsValidator, validate, loanApplicationController.listApplications);
router.post("/", submitLoanApplicationValidator, validate, loanApplicationController.submitApplication);
router.get("/:id", applicationIdParamValidator, validate, loanApplicationController.getApplication);
router.post(
  "/:id/cancel",
  applicationIdParamValidator,
  validate,
  loanApplicationController.cancelApplication
);

export default router;
