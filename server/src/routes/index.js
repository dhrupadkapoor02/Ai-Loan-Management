import { Router } from "express";
import healthRoutes from "./health.routes.js";

const router = Router();

// Every feature module mounts its router here, e.g.:
// router.use("/auth", authRoutes);
// router.use("/expenses", expenseRoutes);
router.use("/health", healthRoutes);

export default router;
