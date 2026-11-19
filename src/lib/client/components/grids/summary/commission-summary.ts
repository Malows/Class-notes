import type { Assignment } from "$lib/common/types/academic";
import type { AttendanceGrid } from "$lib/common/types/attendance";
import type { EnrollmentGridRowDTO } from "$lib/common/types/dto";
import {
  getOverviewDeliveryStatus,
  OverviewDeliveryStatus,
  type Delivery,
} from "$lib/common/types/student";

export interface GradeSummary {
  approved: number;
  rejected: number;
  pendingCorrection: number;
  notDelivered: number;
  /** Every expected delivery cell, including the ones the sheet did not return. */
  total: number;
  /** Approved plus rejected: a delivery whose grade is already decided. */
  corrected: number;
  approvalRate: number | null;
  correctionRate: number | null;
  /** At least one real delivery cell exists, as opposed to an empty grid. */
  hasDeliveries: boolean;
}

export interface AttendanceSummary {
  present: number;
  recorded: number;
  rate: number | null;
  /** Assignments with at least one record; untaken assignments are out of scope. */
  assignmentsWithRecords: number;
}

function percentage(part: number, total: number): number | null {
  return total > 0 ? Math.round((part / total) * 100) : null;
}

/**
 * Aggregate the delivery sheet of a commission. A row without deliveries for an
 * assignment is a missing sheet, not a zero: expected cells are counted as
 * not delivered so the counts still add up to the grid's scope.
 */
export function computeGradeSummary(
  grid: EnrollmentGridRowDTO[] | null | undefined,
  assignments: Assignment[] | null | undefined = [],
): GradeSummary {
  const rows = grid ?? [];
  const assignmentIds = new Set((assignments ?? []).map((assignment) => assignment.id));
  const cells: Delivery[] = [];

  for (const row of rows) {
    for (const delivery of row.deliveries ?? []) {
      if (assignmentIds.size === 0 || assignmentIds.has(delivery.assignment_id)) {
        cells.push(delivery);
      }
    }
  }

  const expected =
    assignmentIds.size > 0 ? rows.length * assignmentIds.size : cells.length;
  const missing = Math.max(0, expected - cells.length);

  let approved = 0;
  let rejected = 0;
  let pendingCorrection = 0;
  let pendingDelivery = 0;

  for (const delivery of cells) {
    switch (getOverviewDeliveryStatus(delivery)) {
      case OverviewDeliveryStatus.APPROVED:
        approved++;
        break;
      case OverviewDeliveryStatus.REJECTED:
        rejected++;
        break;
      case OverviewDeliveryStatus.PENDING_CORRECTION:
        pendingCorrection++;
        break;
      case OverviewDeliveryStatus.PENDING_DELIVERY:
        pendingDelivery++;
        break;
    }
  }

  const notDelivered = pendingDelivery + missing;
  const total = cells.length + missing;
  const corrected = approved + rejected;
  const hasDeliveries = cells.length > 0;

  return {
    approved,
    rejected,
    pendingCorrection,
    notDelivered,
    total,
    corrected,
    approvalRate: hasDeliveries ? percentage(approved, total) : null,
    correctionRate: hasDeliveries ? percentage(corrected, total) : null,
    hasDeliveries,
  };
}

/**
 * Present over recorded, but only for assignments that were actually taken.
 * A column with `taken_count === 0` (or a missing column) is not an absence.
 */
export function computeAttendanceSummary(
  grid: AttendanceGrid | null | undefined,
): AttendanceSummary {
  const taken = (grid?.columns ?? []).filter((column) => column.taken_count > 0);

  const present = taken.reduce((sum, column) => sum + column.present_count, 0);
  const recorded = taken.reduce((sum, column) => sum + column.taken_count, 0);

  return {
    present,
    recorded,
    rate: percentage(present, recorded),
    assignmentsWithRecords: taken.length,
  };
}
