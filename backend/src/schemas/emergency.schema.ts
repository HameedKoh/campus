import { z } from "zod";

export const createEmergencySchema = z.object({
  message: z.string().min(5).max(300),
  linkedAssessmentId: z.string().optional(),
  severity: z.enum(["MODERATE", "EMERGENCY"]).optional()
});

export const emergencyParamsSchema = z.object({
  id: z.string().min(1)
});
