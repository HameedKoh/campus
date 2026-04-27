import { Router } from "express";
import { recordController } from "../controllers/record.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateRequest } from "../middleware/validate";
import { createRecordEntrySchema, recordParamsSchema } from "../schemas/record.schema";
import { asyncHandler } from "../utils/async-handler";

export const recordRouter = Router();

recordRouter.get("/me", authenticate, requireRole("STUDENT"), asyncHandler(recordController.mine));
recordRouter.get(
  "/:studentId",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  validateRequest({ params: recordParamsSchema }),
  asyncHandler(recordController.studentRecords)
);
recordRouter.post(
  "/:studentId/entries",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  validateRequest({ params: recordParamsSchema, body: createRecordEntrySchema }),
  asyncHandler(recordController.createEntry)
);
