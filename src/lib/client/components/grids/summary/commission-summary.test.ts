import { describe, expect, test } from "vitest";

import type { AttendanceGrid } from "$lib/common/types/attendance";
import type { EnrollmentGridRowDTO } from "$lib/common/types/dto";
import { DeliveryWorkflowStatus, type Delivery } from "$lib/common/types/student";

import { computeAttendanceSummary, computeGradeSummary } from "./commission-summary";

function delivery(
  assignmentId: number,
  enrollmentId: number,
  workflowStatus: DeliveryWorkflowStatus,
): Delivery {
  return {
    assignment_id: assignmentId,
    enrollment_id: enrollmentId,
    grade: 0,
    ai_level: 0,
    comments: "",
    workflow_status: workflowStatus,
  };
}

function row(
  enrollmentId: number,
  deliveries: Delivery[],
  name = `Student ${enrollmentId}`,
): EnrollmentGridRowDTO {
  return { id: enrollmentId, enrollment_id: enrollmentId, name, deliveries };
}

function attendanceGrid(
  columns: Array<{ assignment_id: number; present_count: number; taken_count: number }>,
): AttendanceGrid {
  return {
    scope: "commission",
    subject: { id: 1, name: "Subject", slug: "subject", faculty_slug: "faculty" },
    period: { id: 1, year: 2026, semester: 1 },
    commission: { id: 1, name: "Morning", slug: "morning" },
    commissions: [],
    assignments: [],
    rows: [],
    columns,
  };
}

describe("computeGradeSummary", () => {
  test("counts every delivery status and derives both rates", () => {
    const grid = [
      row(1, [
        delivery(1, 1, DeliveryWorkflowStatus.APPROVED),
        delivery(2, 1, DeliveryWorkflowStatus.WAITING_FOR_CORRECTION),
      ]),
      row(2, [
        delivery(1, 2, DeliveryWorkflowStatus.REJECTED),
        delivery(2, 2, DeliveryWorkflowStatus.NOT_DICTATED),
      ]),
    ];
    const assignments = [
      { id: 1, subject_period_id: 1, title: "TP 1" },
      { id: 2, subject_period_id: 1, title: "TP 2" },
    ];

    expect(computeGradeSummary(grid, assignments)).toEqual({
      approved: 1,
      rejected: 1,
      pendingCorrection: 1,
      notDelivered: 1,
      total: 4,
      corrected: 2,
      approvalRate: 25,
      correctionRate: 50,
      hasDeliveries: true,
    });
  });

  test("counts a missing delivery sheet as not delivered instead of dropping the row", () => {
    const grid = [
      row(1, [delivery(1, 1, DeliveryWorkflowStatus.APPROVED)]),
      row(2, []),
    ];
    const assignments = [
      { id: 1, subject_period_id: 1, title: "TP 1" },
      { id: 2, subject_period_id: 1, title: "TP 2" },
    ];

    const summary = computeGradeSummary(grid, assignments);

    expect(summary.total).toBe(4);
    expect(summary.approved).toBe(1);
    expect(summary.notDelivered).toBe(3);
    expect(summary.hasDeliveries).toBe(true);
    expect(summary.correctionRate).toBe(25);
  });

  test("reports an empty commission without inventing a zero percent rate", () => {
    const summary = computeGradeSummary([], [
      { id: 1, subject_period_id: 1, title: "TP 1" },
    ]);

    expect(summary).toEqual({
      approved: 0,
      rejected: 0,
      pendingCorrection: 0,
      notDelivered: 0,
      total: 0,
      corrected: 0,
      approvalRate: null,
      correctionRate: null,
      hasDeliveries: false,
    });
  });

  test("handles rows whose deliveries arrive without an assignment list", () => {
    const grid = [
      row(1, [
        delivery(1, 1, DeliveryWorkflowStatus.APPROVED),
        delivery(2, 1, DeliveryWorkflowStatus.APPROVED),
        delivery(3, 1, DeliveryWorkflowStatus.REJECTED),
      ]),
    ];

    const summary = computeGradeSummary(grid, []);

    expect(summary.total).toBe(3);
    expect(summary.approved).toBe(2);
    expect(summary.rejected).toBe(1);
    expect(summary.correctionRate).toBe(100);
    expect(summary.approvalRate).toBe(67);
  });

  test("rounds a rate to the nearest whole percent", () => {
    const grid = [
      row(1, [
        delivery(1, 1, DeliveryWorkflowStatus.APPROVED),
        delivery(2, 1, DeliveryWorkflowStatus.WAITING_FOR_CORRECTION),
        delivery(3, 1, DeliveryWorkflowStatus.WAITING_FOR_STUDENTS),
      ]),
    ];

    expect(computeGradeSummary(grid, []).approvalRate).toBe(33);
    expect(computeGradeSummary(grid, []).correctionRate).toBe(33);
  });
});

describe("computeAttendanceSummary", () => {
  test("counts present over recorded and ignores untaken assignments", () => {
    const summary = computeAttendanceSummary(
      attendanceGrid([
        { assignment_id: 1, present_count: 3, taken_count: 4 },
        { assignment_id: 2, present_count: 0, taken_count: 0 },
        { assignment_id: 3, present_count: 1, taken_count: 1 },
      ]),
    );

    expect(summary).toEqual({
      present: 4,
      recorded: 5,
      rate: 80,
      assignmentsWithRecords: 2,
    });
  });

  test("reports no records without a measured zero percent", () => {
    expect(
      computeAttendanceSummary(
        attendanceGrid([{ assignment_id: 1, present_count: 0, taken_count: 0 }]),
      ),
    ).toEqual({ present: 0, recorded: 0, rate: null, assignmentsWithRecords: 0 });

    expect(computeAttendanceSummary(null)).toEqual({
      present: 0,
      recorded: 0,
      rate: null,
      assignmentsWithRecords: 0,
    });
  });
});
