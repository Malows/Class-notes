import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, configure } from "@testing-library/svelte";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";
import type { AttendanceGrid } from "$lib/common/types/attendance";
import type { EnrollmentGridRowDTO } from "$lib/common/types/dto";
import { DeliveryWorkflowStatus } from "$lib/common/types/student";

import CommissionSummary from "./CommissionSummary.svelte";

configure({ testIdAttribute: "data-test-id" });

const baseHref = "/faculties/engineering/subjects/algebra/periods/2026/1/commissions/morning";
const assignmentsHref = "/faculties/engineering/subjects/algebra/periods/2026/1/assignments";

const assignments = [
  { id: 7, subject_period_id: 1, title: "TP 1" },
  { id: 8, subject_period_id: 1, title: "TP 2" },
];

function row(
  enrollmentId: number,
  workflowStatuses: DeliveryWorkflowStatus[],
): EnrollmentGridRowDTO {
  return {
    id: enrollmentId,
    enrollment_id: enrollmentId,
    name: `Student ${enrollmentId}`,
    deliveries: workflowStatuses.map((workflowStatus, index) => ({
      assignment_id: assignments[index]?.id ?? index + 1,
      enrollment_id: enrollmentId,
      grade: 0,
      ai_level: 0,
      comments: "",
      workflow_status: workflowStatus,
    })),
  };
}

function attendance(columns: AttendanceGrid["columns"]): AttendanceGrid {
  return {
    scope: "commission",
    subject: { id: 1, name: "Algebra", slug: "algebra", faculty_slug: "engineering" },
    period: { id: 1, year: 2026, semester: 1 },
    commission: { id: 1, name: "Morning", slug: "morning" },
    commissions: [],
    assignments: [],
    rows: [],
    columns,
  };
}

beforeEach(async () => {
  await loadTranslations("en", "/");
});

describe("CommissionSummary", () => {
  test("renders grade counts, approval rate, correction progress and attendance", () => {
    render(CommissionSummary, {
      assignments,
      grid: [
        row(1, [DeliveryWorkflowStatus.APPROVED, DeliveryWorkflowStatus.WAITING_FOR_CORRECTION]),
        row(2, [DeliveryWorkflowStatus.REJECTED, DeliveryWorkflowStatus.NOT_DICTATED]),
      ],
      attendanceGrid: attendance([{ assignment_id: 7, present_count: 3, taken_count: 4 }]),
      attendanceLoading: false,
      attendanceFailed: false,
      commissionBaseHref: baseHref,
      assignmentsHref,
    });

    expect(screen.getByTestId("commission-summary")).toBeInTheDocument();
    expect(screen.getByTestId("summary-approved")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-rejected")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-pending-correction")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-not-delivered")).toHaveTextContent("1");
    expect(screen.getByTestId("summary-total")).toHaveTextContent("4");
    expect(screen.getByTestId("summary-approval-rate")).toHaveTextContent("25%");
    expect(screen.getByTestId("summary-correction-progress")).toHaveTextContent("2 of 4 (50%)");
    expect(screen.getByTestId("attendance-rate")).toHaveTextContent("75%");
    expect(screen.getByTestId("attendance-counts")).toHaveTextContent(
      "3 present of 4 recorded",
    );
  });

  test("says attendance has not been taken without showing a measured zero", () => {
    render(CommissionSummary, {
      assignments,
      grid: [row(1, [DeliveryWorkflowStatus.APPROVED])],
      attendanceGrid: attendance([{ assignment_id: 7, present_count: 0, taken_count: 0 }]),
      attendanceLoading: false,
      attendanceFailed: false,
      commissionBaseHref: baseHref,
      assignmentsHref,
    });

    expect(screen.getByTestId("attendance-empty")).toHaveTextContent(
      "Attendance has not been taken yet.",
    );
    expect(screen.queryByTestId("attendance-rate")).toBeNull();
    expect(screen.queryByTestId("attendance-counts")).toBeNull();
  });

  test("keeps grade aggregates when attendance fails and retries independently", async () => {
    const retry = vi.fn();
    render(CommissionSummary, {
      assignments,
      grid: [row(1, [DeliveryWorkflowStatus.APPROVED])],
      attendanceGrid: null,
      attendanceLoading: false,
      attendanceFailed: true,
      onRetryAttendance: retry,
      commissionBaseHref: baseHref,
      assignmentsHref,
    });

    expect(screen.getByTestId("summary-approved")).toHaveTextContent("1");
    expect(screen.getByTestId("attendance-error")).toHaveTextContent(
      "Attendance could not be loaded.",
    );

    await fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  test("renders a quiet empty state when there is no delivery sheet", () => {
    render(CommissionSummary, {
      assignments: [],
      grid: [],
      attendanceGrid: null,
      attendanceLoading: false,
      attendanceFailed: false,
      commissionBaseHref: baseHref,
      assignmentsHref,
    });

    expect(screen.getByTestId("summary-no-deliveries")).toHaveTextContent(
      "Nothing to correct yet.",
    );
    expect(screen.queryByTestId("summary-approval-rate")).toBeNull();
    expect(screen.queryByTestId("summary-correction-progress")).toBeNull();
    expect(screen.getByTestId("summary-no-assignments")).toHaveTextContent(
      "There is no practical assignment to correct yet.",
    );
    expect(screen.getByTestId("summary-define-assignments")).toHaveAttribute(
      "href",
      assignmentsHref,
    );
  });

  test("labels a single assignment's commission-wide correction action", () => {
    render(CommissionSummary, {
      assignments: [assignments[0]],
      grid: [row(1, [DeliveryWorkflowStatus.APPROVED])],
      attendanceGrid: null,
      attendanceLoading: false,
      attendanceFailed: false,
      commissionBaseHref: baseHref,
      assignmentsHref,
    });

    const action = screen.getByTestId("correct-commission-action");
    expect(action.tagName).toBe("A");
    expect(action).toHaveAttribute("href", `${baseHref}/correct?assignment_id=7`);
    expect(action).toHaveTextContent("Correct commission");
  });

  test("asks which assignment to correct instead of guessing", async () => {
    render(CommissionSummary, {
      assignments,
      grid: [row(1, [DeliveryWorkflowStatus.APPROVED, DeliveryWorkflowStatus.REJECTED])],
      attendanceGrid: null,
      attendanceLoading: false,
      attendanceFailed: false,
      commissionBaseHref: baseHref,
      assignmentsHref,
    });

    const select = screen.getByTestId("summary-assignment-select");
    expect(select).toBeInTheDocument();

    const disabledAction = screen.getByTestId("correct-commission-action");
    expect(disabledAction.tagName).toBe("BUTTON");
    expect(disabledAction).toBeDisabled();

    await fireEvent.change(select, { target: { value: "8" } });

    const action = screen.getByTestId("correct-commission-action");
    expect(action.tagName).toBe("A");
    expect(action).toHaveAttribute("href", `${baseHref}/correct?assignment_id=8`);
    expect(action).toHaveTextContent("Correct commission");
  });
});
