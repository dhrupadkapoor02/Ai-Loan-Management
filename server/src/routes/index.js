import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

// Every feature module mounts its router here, e.g.:
// router.use("/expenses", expenseRoutes);
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

export default router;
