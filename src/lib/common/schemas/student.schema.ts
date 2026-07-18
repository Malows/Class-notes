import { VALIDATION_KEYS } from "$lib/common/constants";
import { z } from "zod";

export const CreateStudentsSchema = z.object({
  commission_id: z.number().min(1, VALIDATION_KEYS.COMMISSION_ID_REQUIRED),
  names: z
    .array(z.string().min(1, VALIDATION_KEYS.NAME_REQUIRED))
    .min(1, VALIDATION_KEYS.AT_LEAST_ONE_NAME_REQUIRED),
});
