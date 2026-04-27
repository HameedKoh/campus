import { Router } from "express";
import { assessmentController } from "../controllers/assessment.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateRequest } from "../middleware/validate";
import { createAssessmentSchema, assessmentParamsSchema } from "../schemas/assessment.schema";
import { asyncHandler } from "../utils/async-handler";

export const assessmentRouter = Router();

assessmentRouter.post(
  "/",
  authenticate,
  requireRole("STUDENT"),
  validateRequest({ body: createAssessmentSchema }),
  asyncHandler(assessmentController.create)
);

assessmentRouter.get("/me", authenticate, requireRole("STUDENT"), asyncHandler(assessmentController.mine));
assessmentRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: assessmentParamsSchema }),
  asyncHandler(assessmentController.byId)
);
