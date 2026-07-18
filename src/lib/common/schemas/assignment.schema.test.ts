import { describe, expect, test } from "vitest";

import { VALIDATION_KEYS } from "$lib/common/constants";

import { CopyAssignmentsSchema, CreateAssignmentSchema } from "./assignment.schema";

describe("assignment schemas", () => {
  test("CreateAssignmentSchema accepts valid assignment data", () => {
    const result = CreateAssignmentSchema.safeParse({ period_id: 1, title: "Trabajo práctico" });

    expect(result.success).toBe(true);
  });

  test("CreateAssignmentSchema rejects an empty title", () => {
    const result = CreateAssignmentSchema.safeParse({ period_id: 1, title: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.TITLE_REQUIRED);
    }
  });

  test("CopyAssignmentsSchema accepts valid source and target periods", () => {
    const result = CopyAssignmentsSchema.safeParse({ source_period_id: 1, target_period_id: 2 });

    expect(result.success).toBe(true);
  });

  test("CopyAssignmentsSchema rejects invalid target period", () => {
    const result = CopyAssignmentsSchema.safeParse({ source_period_id: 1, target_period_id: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VALIDATION_KEYS.TARGET_PERIOD_ID_REQUIRED);
    }
  });
});
