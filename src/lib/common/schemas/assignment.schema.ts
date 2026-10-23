import { VALIDATION_KEYS } from "$lib/common/constants";
import { z } from "zod";

export const CreateAssignmentSchema = z.object({
  subject_period_id: z.number().min(1, VALIDATION_KEYS.SUBJECT_PERIOD_ID_REQUIRED),
  title: z.string().min(1, VALIDATION_KEYS.TITLE_REQUIRED),
});

export const CopyAssignmentsSchema = z.object({
  source_subject_period_id: z.number().min(1, VALIDATION_KEYS.SOURCE_PERIOD_ID_REQUIRED),
  target_subject_period_id: z.number().min(1, VALIDATION_KEYS.TARGET_PERIOD_ID_REQUIRED),
});
