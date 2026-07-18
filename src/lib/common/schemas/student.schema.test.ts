import { describe, expect, test } from "vitest";

import { VALIDATION_KEYS } from "$lib/common/constants";

import { CreateStudentsSchema } from "./student.schema";

describe("CreateStudentsSchema", () => {
  test("accepts a list of student names", () => {
    const result = CreateStudentsSchema.safeParse({
      commission_id: 3,
      names: ["Ana", "Luis"],
    });

    expect(result.success).toBe(true);
  });

  test("rejects an empty list of names", () => {
    const result = CreateStudentsSchema.safeParse({ commission_id: 3, names: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.AT_LEAST_ONE_NAME_REQUIRED);
    }
  });

  test("rejects an empty student name", () => {
    const result = CreateStudentsSchema.safeParse({ commission_id: 3, names: [""] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.NAME_REQUIRED);
    }
  });
});
