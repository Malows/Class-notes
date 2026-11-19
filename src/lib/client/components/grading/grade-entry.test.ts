import { describe, expect, it } from "vitest";

import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";
import { DeliveryWorkflowStatus, type Delivery } from "$lib/common/types/student";

import {
  buildGradeRows,
  countCorrected,
  deliveryFromRow,
  formatGradeValue,
  initialDraft,
  isRowDirty,
  parseGradeInput,
  validateGradeRow,
} from "./grade-entry";

function enrollment(id: number, name: string): EnrollmentWithPerson {
  return {
    id,
    person_id: id,
    subject_period_id: 1,
    commission_id: 1,
    name,
    legajo: `LEG-${id}`,
  };
}

function delivery(overrides: Partial<Delivery> = {}): Delivery {
  return {
    assignment_id: 7,
    enrollment_id: 1,
    grade: 0,
    ai_level: 0,
    comments: "",
    workflow_status: DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
    ...overrides,
  };
}

describe("parseGradeInput", () => {
  it("accepts integers, decimals and the Spanish comma", () => {
    expect(parseGradeInput("8")).toEqual({ value: 8 });
    expect(parseGradeInput("8,5")).toEqual({ value: 8.5 });
    expect(parseGradeInput("10")).toEqual({ value: 10 });
    expect(parseGradeInput("0")).toEqual({ value: 0 });
    expect(parseGradeInput(" 7.5 ")).toEqual({ value: 7.5 });
  });

  it("asks for a grade when the field is empty", () => {
    expect(parseGradeInput("   ")).toEqual({ error: "required" });
  });

  it("rejects formats the scale does not allow", () => {
    expect(parseGradeInput("8,55")).toEqual({ error: "format" });
    expect(parseGradeInput("ocho")).toEqual({ error: "format" });
    expect(parseGradeInput("-2")).toEqual({ error: "format" });
    expect(parseGradeInput("1e1")).toEqual({ error: "format" });
  });

  it("rejects values outside 0–10", () => {
    expect(parseGradeInput("11")).toEqual({ error: "range" });
    expect(parseGradeInput("10.1")).toEqual({ error: "range" });
  });
});

describe("grade rows", () => {
  it("hides the default grade 0 on a pending delivery and keeps a real 0", () => {
    const pending = initialDraft(delivery({ grade: 0 }), "es");
    expect(pending.grade).toBe("");
    expect(pending.verdict).toBe("");

    const failed = initialDraft(
      delivery({
        grade: 0,
        workflow_status: DeliveryWorkflowStatus.REJECTED,
      }),
      "es",
    );
    expect(failed.grade).toBe("0");
    expect(failed.verdict).toBe(DeliveryWorkflowStatus.REJECTED);
  });

  it("formats decimals with the locale separator", () => {
    expect(formatGradeValue(8.5, "es")).toBe("8,5");
    expect(formatGradeValue(8.5, "en")).toBe("8.5");
    expect(formatGradeValue(10, "es")).toBe("10");
  });

  it("builds one row per enrollment and marks the ones without a sheet", () => {
    const rows = buildGradeRows(
      [enrollment(1, "Ana"), enrollment(2, "Bruno")],
      [delivery({ enrollment_id: 1, grade: 8, workflow_status: DeliveryWorkflowStatus.APPROVED })],
      "es",
    );

    expect(rows).toHaveLength(2);
    expect(rows[0].saved_status).toBe(DeliveryWorkflowStatus.APPROVED);
    expect(rows[0].has_sheet).toBe(true);
    expect(rows[1].saved_status).toBeNull();
    expect(rows[1].has_sheet).toBe(false);
  });

  it("counts only approved or rejected rows as corrected", () => {
    const rows = buildGradeRows(
      [enrollment(1, "Ana"), enrollment(2, "Bruno"), enrollment(3, "Carla")],
      [
        delivery({ enrollment_id: 1, grade: 9, workflow_status: DeliveryWorkflowStatus.APPROVED }),
        delivery({ enrollment_id: 2, grade: 4, workflow_status: DeliveryWorkflowStatus.REJECTED }),
        // A grade without a verdict is still pending.
        delivery({ enrollment_id: 3, grade: 6 }),
      ],
      "es",
    );

    expect(countCorrected(rows)).toBe(2);
  });
});

describe("validateGradeRow", () => {
  const rows = () =>
    buildGradeRows(
      [enrollment(1, "Ana")],
      [delivery({ enrollment_id: 1, workflow_status: DeliveryWorkflowStatus.WAITING_FOR_CORRECTION })],
      "es",
    );

  it("requires a verdict once a grade is typed", () => {
    const row = rows()[0];
    row.draft.grade = "8";
    expect(validateGradeRow(row)).toEqual({ verdict: "required" });
  });

  it("requires a grade once a verdict is chosen", () => {
    const row = rows()[0];
    row.draft.verdict = DeliveryWorkflowStatus.APPROVED;
    expect(validateGradeRow(row)).toEqual({ grade: "required" });
  });

  it("reports the scale error in the grade field", () => {
    const row = rows()[0];
    row.draft.grade = "11";
    row.draft.verdict = DeliveryWorkflowStatus.APPROVED;
    expect(validateGradeRow(row)).toEqual({ grade: "range" });
  });

  it("lets a comment-only edit save without a grade or verdict", () => {
    const row = rows()[0];
    row.draft.comments = "Faltan los puntos 3 y 4";
    expect(validateGradeRow(row)).toEqual({});
    expect(isRowDirty(row)).toBe(true);
  });

  it("maps the draft to a delivery and keeps the pending status without a verdict", () => {
    const row = rows()[0];
    row.draft.grade = "6,5";
    row.draft.ai_level = 2;
    row.draft.comments = "Con ayuda de IA";

    expect(deliveryFromRow(row, 7)).toEqual({
      assignment_id: 7,
      enrollment_id: 1,
      grade: 6.5,
      ai_level: 2,
      comments: "Con ayuda de IA",
      workflow_status: DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
    });

    row.draft.verdict = DeliveryWorkflowStatus.REJECTED;
    expect(deliveryFromRow(row, 7).workflow_status).toBe(DeliveryWorkflowStatus.REJECTED);
  });

  it("is not dirty before an edit and dirty after one", () => {
    const row = rows()[0];
    expect(isRowDirty(row)).toBe(false);
    row.draft.grade = "7";
    expect(isRowDirty(row)).toBe(true);
  });
});
