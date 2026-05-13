import { z } from "zod";

export const createAppointmentSchema = z.object({
  preferredDateTime: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Preferred date and time must be a valid date"
    }),
  reason: z.string().min(5).max(300),
  triageReferenceId: z.string().optional()
});

export const appointmentIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["APPROVED", "RESCHEDULED", "REJECTED", "CANCELLED", "COMPLETED"]),
  clinicianResponse: z.string().max(300).optional()
});

export const assignAppointmentSchema = z.object({
  assignedDoctorId: z.string().min(1)
});
