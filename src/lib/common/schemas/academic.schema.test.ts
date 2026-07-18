import { describe, expect, test } from "vitest";

import { VALIDATION_KEYS } from "$lib/common/constants";

import {
  CreateCommissionSchema,
  CreateFacultySchema,
  CreatePeriodSchema,
  CreateSubjectSchema,
} from "./academic.schema";

describe("academic schemas", () => {
  test("CreateFacultySchema accepts a valid faculty", () => {
    const result = CreateFacultySchema.safeParse({ name: "Facultad de Ingeniería" });

    expect(result.success).toBe(true);
  });

  test("CreateFacultySchema rejects an empty name", () => {
    const result = CreateFacultySchema.safeParse({ name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.NAME_REQUIRED);
    }
  });

  test("CreateSubjectSchema accepts a valid subject", () => {
    const result = CreateSubjectSchema.safeParse({
      faculty_id: 1,
      name: "Matemática Discreta",
    });

    expect(result.success).toBe(true);
  });

  test("CreateSubjectSchema rejects a missing faculty id", () => {
    const result = CreateSubjectSchema.safeParse({ faculty_id: 0, name: "Álgebra" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.FACULTY_ID_REQUIRED);
    }
  });

  test("CreatePeriodSchema accepts valid period data", () => {
    const result = CreatePeriodSchema.safeParse({
      subject_id: 2,
      year: 2026,
      semester: 1,
    });

    expect(result.success).toBe(true);
  });

  test("CreatePeriodSchema rejects an invalid semester", () => {
    const result = CreatePeriodSchema.safeParse({ subject_id: 2, year: 2026, semester: 3 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.SEMESTER_RANGE);
    }
  });

  test("CreateCommissionSchema accepts a valid commission", () => {
    const result = CreateCommissionSchema.safeParse({ period_id: 10, name: "Comisión A" });

    expect(result.success).toBe(true);
  });

  test("CreateCommissionSchema rejects an empty name", () => {
    const result = CreateCommissionSchema.safeParse({ period_id: 10, name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.NAME_REQUIRED);
    }
  });
});
