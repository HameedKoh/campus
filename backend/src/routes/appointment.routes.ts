import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/require-role";
import { validateRequest } from "../middleware/validate";
import {
  appointmentIdParamsSchema,
  assignAppointmentSchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema
} from "../schemas/appointment.schema";
import { asyncHandler } from "../utils/async-handler";

export const appointmentRouter = Router();

appointmentRouter.post(
  "/",
  authenticate,
  requireRole("STUDENT"),
  validateRequest({ body: createAppointmentSchema }),
  asyncHandler(appointmentController.create)
);

appointmentRouter.get("/me", authenticate, requireRole("STUDENT"), asyncHandler(appointmentController.mine));
appointmentRouter.get("/", authenticate, requireRole("DOCTOR", "ADMIN"), asyncHandler(appointmentController.queue));
appointmentRouter.patch(
  "/:id/status",
  authenticate,
  validateRequest({ params: appointmentIdParamsSchema, body: updateAppointmentStatusSchema }),
  asyncHandler(appointmentController.updateStatus)
);
appointmentRouter.patch(
  "/:id/assign",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  validateRequest({ params: appointmentIdParamsSchema, body: assignAppointmentSchema }),
  asyncHandler(appointmentController.assign)
);
