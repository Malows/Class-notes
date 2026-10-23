import { VALIDATION_KEYS } from "$lib/common/constants";
import { z } from "zod";

export const EnrollmentEntrySchema = z.object({
  name: z.string().trim().min(1, VALIDATION_KEYS.NAME_REQUIRED),
  legajo: z.string().nullish(),
  person_id: z.number().min(1).optional(),
});

export const RegisterEnrollmentsSchema = z.object({
  subject_period_id: z.number().min(1, VALIDATION_KEYS.SUBJECT_PERIOD_ID_REQUIRED),
  commission_id: z.number().min(1, VALIDATION_KEYS.COMMISSION_ID_REQUIRED).nullable().optional(),
  entries: z
    .array(EnrollmentEntrySchema)
    .min(1, VALIDATION_KEYS.AT_LEAST_ONE_NAME_REQUIRED),
});
