import { VALIDATION_KEYS } from "$lib/constants";
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

export const CreateStudentsSchema = z.object({
  commission_id: z.number().min(1, VALIDATION_KEYS.COMMISSION_ID_REQUIRED),
  names: z
    .array(z.string().min(1, VALIDATION_KEYS.NAME_REQUIRED))
    .min(1, VALIDATION_KEYS.AT_LEAST_ONE_NAME_REQUIRED),
});

export const CreateAssignmentSchema = z.object({
  period_id: z.number().min(1, VALIDATION_KEYS.PERIOD_ID_REQUIRED),
  title: z.string().min(1, VALIDATION_KEYS.TITLE_REQUIRED),
});

export const CopyAssignmentsSchema = z.object({
  source_period_id: z.number().min(1, VALIDATION_KEYS.SOURCE_PERIOD_ID_REQUIRED),
  target_period_id: z.number().min(1, VALIDATION_KEYS.TARGET_PERIOD_ID_REQUIRED),
});

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
