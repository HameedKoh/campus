import { z } from "zod";

export const recordParamsSchema = z.object({
  studentId: z.string().min(1)
});

export const createRecordEntrySchema = z.object({
  type: z.enum(["CLINICAL_NOTE", "TRIAGE_SUMMARY", "APPOINTMENT_NOTE", "EMERGENCY_NOTE"]),
  title: z.string().min(3).max(120),
  note: z.string().min(5).max(2000)
});
