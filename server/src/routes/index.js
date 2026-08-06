import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import incomeRoutes from "./income.routes.js";
import expenseRoutes from "./expense.routes.js";
import budgetRoutes from "./budget.routes.js";
import savingsGoalRoutes from "./savingsGoal.routes.js";
import transactionRoutes from "./transaction.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import loanRoutes from "./loan.routes.js";
import loanApplicationRoutes from "./loanApplication.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/incomes", incomeRoutes);
router.use("/expenses", expenseRoutes);
router.use("/budgets", budgetRoutes);
router.use("/savings-goals", savingsGoalRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/loans", loanRoutes);
router.use("/loan-applications", loanApplicationRoutes);

export default router;
