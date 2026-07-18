import { VALIDATION_KEYS } from "$lib/common/constants";
import { z } from "zod";

export const CreateFacultySchema = z.object({
  name: z.string().min(1, VALIDATION_KEYS.NAME_REQUIRED),
});

export const CreateSubjectSchema = z.object({
  faculty_id: z.number().min(1, VALIDATION_KEYS.FACULTY_ID_REQUIRED),
  name: z.string().min(1, VALIDATION_KEYS.NAME_REQUIRED),
});

export const CreatePeriodSchema = z.object({
  subject_id: z.number().min(1, VALIDATION_KEYS.SUBJECT_ID_REQUIRED),
  year: z.number().min(2000, VALIDATION_KEYS.YEAR_MIN),
  semester: z
    .number()
    .min(1, VALIDATION_KEYS.SEMESTER_RANGE)
    .max(2, VALIDATION_KEYS.SEMESTER_RANGE),
});

export const CreateCommissionSchema = z.object({
  period_id: z.number().min(1, VALIDATION_KEYS.PERIOD_ID_REQUIRED),
  name: z.string().min(1, VALIDATION_KEYS.NAME_REQUIRED),
});
