import { z } from "zod";

export const SaveDeliverySchema = z.object({
  assignment_id: z.number().min(1),
  student_id: z.number().min(1),
  workflow_status: z.enum([
    "NOT_DICTATED",
    "WAITING_FOR_STUDENTS",
    "WAITING_FOR_CORRECTION",
    "APPROVED",
    "REJECTED",
  ]),
  grade: z.number().min(0).max(10),
  ai_level: z.number().min(0).max(2),
  comments: z.string().optional(),
});
