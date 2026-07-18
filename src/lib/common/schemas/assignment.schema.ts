import { VALIDATION_KEYS } from "$lib/common/constants";
import { z } from "zod";

export const CreateAssignmentSchema = z.object({
  period_id: z.number().min(1, VALIDATION_KEYS.PERIOD_ID_REQUIRED),
  title: z.string().min(1, VALIDATION_KEYS.TITLE_REQUIRED),
});

export const CopyAssignmentsSchema = z.object({
  source_period_id: z.number().min(1, VALIDATION_KEYS.SOURCE_PERIOD_ID_REQUIRED),
  target_period_id: z.number().min(1, VALIDATION_KEYS.TARGET_PERIOD_ID_REQUIRED),
});
