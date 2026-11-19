import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";
import { DeliveryWorkflowStatus, type Delivery } from "$lib/common/types/student";

/** The grade scale is fixed by the delivery record: 0–10, one decimal at most. */
export const GRADE_MIN = 0;
export const GRADE_MAX = 10;
export const GRADE_DECIMALS = 1;

export type Verdict = "" | DeliveryWorkflowStatus.APPROVED | DeliveryWorkflowStatus.REJECTED;

export type GradeErrorCode = "required" | "format" | "range";

export interface GradeErrors {
  grade?: GradeErrorCode;
  verdict?: "required";
}

export interface GradeDraft {
  grade: string;
  verdict: Verdict;
  ai_level: number;
  comments: string;
}

export interface GradeRow {
  enrollment_id: number;
  name: string;
  legajo: string | null;
  has_sheet: boolean;
  /** Raw persisted workflow status; a comment-only save keeps it. */
  workflow_status: DeliveryWorkflowStatus | null;
  /** Persisted workflow status when the row was loaded or last saved. */
  saved_status: DeliveryWorkflowStatus | null;
  /** Last persisted values; the draft is compared against this. */
  saved: GradeDraft;
  draft: GradeDraft;
  errors: GradeErrors;
  saveError: string;
  saving: boolean;
}

const CORRECTED = new Set<string>([
  DeliveryWorkflowStatus.APPROVED,
  DeliveryWorkflowStatus.REJECTED,
]);

export function isCorrected(status: DeliveryWorkflowStatus | null | undefined): boolean {
  return status !== null && status !== undefined && CORRECTED.has(status);
}

/** Grade numbers are shown with the locale's decimal separator and no grouping. */
export function formatGradeValue(value: number, locale = "es"): string {
  if (!Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: GRADE_DECIMALS,
      useGrouping: false,
    }).format(value);
  } catch {
    return String(value);
  }
}

export type ParseGradeResult = { value: number } | { error: GradeErrorCode };

/**
 * Accepts a comma as the decimal separator (the Spanish keyboard habit) and
 * caps the value at one decimal inside the 0–10 scale. Empty is its own error
 * so the UI can ask for a grade rather than scold about its format.
 */
export function parseGradeInput(raw: string): ParseGradeResult {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "") return { error: "required" };
  if (!/^\d+(\.\d)?$/.test(normalized)) return { error: "format" };

  const value = Number(normalized);
  if (!Number.isFinite(value)) return { error: "format" };
  if (value < GRADE_MIN || value > GRADE_MAX) return { error: "range" };

  return { value };
}

export function initialDraft(delivery: Delivery | null | undefined, locale = "es"): GradeDraft {
  if (!delivery) {
    return { grade: "", verdict: "", ai_level: 0, comments: "" };
  }

  const verdict: Verdict =
    delivery.workflow_status === DeliveryWorkflowStatus.APPROVED
      ? DeliveryWorkflowStatus.APPROVED
      : delivery.workflow_status === DeliveryWorkflowStatus.REJECTED
        ? DeliveryWorkflowStatus.REJECTED
        : "";

  return {
    // A pending delivery keeps its default grade of 0 in the database; showing
    // "0" there would look like every student already failed.
    grade:
      isCorrected(delivery.workflow_status) || delivery.grade > 0
        ? formatGradeValue(delivery.grade, locale)
        : "",
    verdict,
    ai_level: delivery.ai_level ?? 0,
    comments: delivery.comments ?? "",
  };
}

export function buildGradeRows(
  enrollments: EnrollmentWithPerson[],
  deliveries: Delivery[],
  locale = "es",
): GradeRow[] {
  const byEnrollment = new Map(deliveries.map((delivery) => [delivery.enrollment_id, delivery]));

  return enrollments.map((enrollment) => {
    const delivery = byEnrollment.get(enrollment.id) ?? null;
    const draft = initialDraft(delivery, locale);

    return {
      enrollment_id: enrollment.id,
      name: enrollment.name,
      legajo: enrollment.legajo,
      has_sheet: delivery !== null,
      workflow_status: delivery?.workflow_status ?? null,
      saved_status: isCorrected(delivery?.workflow_status) ? delivery!.workflow_status : null,
      saved: { ...draft },
      draft,
      errors: {},
      saveError: "",
      saving: false,
    };
  });
}

export function isRowDirty(row: GradeRow): boolean {
  return (
    row.draft.grade.trim() !== row.saved.grade.trim() ||
    row.draft.verdict !== row.saved.verdict ||
    row.draft.ai_level !== row.saved.ai_level ||
    row.draft.comments !== row.saved.comments
  );
}

/**
 * A grade and a verdict travel together: typing one requires the other. A row
 * edited only for its comment or AI level saves without closing the correction.
 */
export function validateGradeRow(row: GradeRow): GradeErrors {
  const errors: GradeErrors = {};
  const hasGrade = row.draft.grade.trim() !== "";
  const hasVerdict = row.draft.verdict !== "";

  if (hasGrade) {
    const parsed = parseGradeInput(row.draft.grade);
    if ("error" in parsed) errors.grade = parsed.error;
    if (!hasVerdict) errors.verdict = "required";
  } else if (hasVerdict) {
    errors.grade = "required";
  }

  return errors;
}

export function deliveryFromRow(row: GradeRow, assignmentId: number): Delivery {
  const parsed = parseGradeInput(row.draft.grade);
  const grade = "value" in parsed ? parsed.value : 0;
  const workflow_status =
    row.draft.verdict ||
    row.workflow_status ||
    DeliveryWorkflowStatus.WAITING_FOR_CORRECTION;

  return {
    assignment_id: assignmentId,
    enrollment_id: row.enrollment_id,
    grade,
    ai_level: row.draft.ai_level,
    comments: row.draft.comments,
    workflow_status: workflow_status as Delivery["workflow_status"],
  };
}

export function countCorrected(rows: GradeRow[]): number {
  return rows.filter((row) => isCorrected(row.saved_status)).length;
}

export function firstErrorField(errors: GradeErrors): "grade" | "verdict" | null {
  if (errors.grade) return "grade";
  if (errors.verdict) return "verdict";
  return null;
}
