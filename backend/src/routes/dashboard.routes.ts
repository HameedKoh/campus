import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  asyncHandler(dashboardController.summary)
);
