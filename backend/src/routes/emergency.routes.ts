import { Router } from "express";
import { emergencyController } from "../controllers/emergency.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateRequest } from "../middleware/validate";
import { createEmergencySchema, emergencyParamsSchema } from "../schemas/emergency.schema";
import { asyncHandler } from "../utils/async-handler";

export const emergencyRouter = Router();

emergencyRouter.post(
  "/",
  authenticate,
  requireRole("STUDENT"),
  validateRequest({ body: createEmergencySchema }),
  asyncHandler(emergencyController.create)
);
emergencyRouter.get("/", authenticate, asyncHandler(emergencyController.list));
emergencyRouter.patch(
  "/:id/acknowledge",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  validateRequest({ params: emergencyParamsSchema }),
  asyncHandler(emergencyController.acknowledge)
);
emergencyRouter.patch(
  "/:id/resolve",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  validateRequest({ params: emergencyParamsSchema }),
  asyncHandler(emergencyController.resolve)
);
