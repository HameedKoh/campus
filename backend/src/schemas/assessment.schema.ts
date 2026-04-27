import { z } from "zod";

export const createAssessmentSchema = z.object({
  symptoms: z.array(z.string().min(2)).min(1).max(12),
  contextNotes: z.string().max(400).optional()
});

export const assessmentParamsSchema = z.object({
  id: z.string().min(1)
});
