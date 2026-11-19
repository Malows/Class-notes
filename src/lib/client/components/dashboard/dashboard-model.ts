import type { Commission, Period } from "$lib/common/types/academic";
import type { OverviewData } from "$lib/common/types/dashboard";
import { DeliveryWorkflowStatus } from "$lib/common/types/student";

/** A period plus the counts the dashboard needs to describe its scope. */
export interface PeriodOption {
  id: number;
  key: string;
  year: number;
  semester: number;
  commissionCount: number;
  studentCount: number;
  isActive: boolean;
  hasData: boolean;
}

export interface CommissionRow {
  id: number;
  subjectId: number;
  subjectName: string;
  commissionName: string;
  studentCount: number;
  pendingCount: number;
  attendanceHref: string;
  overviewHref: string;
}

export interface PendingRow {
  id: number;
  subjectName: string;
  commissionName: string;
  pendingCount: number;
  href: string;
}

export function periodKey(period: Pick<Period, "year" | "semester">): string {
  return `${period.year}-${period.semester}`;
}

/**
 * Periods are global rows; their dashboard weight comes from the commissions
 * that hang off them. A term with no commission is still listed (the teacher
 * may be setting it up) but it is not a candidate for the automatic default.
 */
export function buildPeriodOptions(
  periods: Period[],
  commissions: Commission[],
  activeKey: string | null,
): PeriodOption[] {
  return periods
    .map((period) => {
      const own = commissions.filter((commission) => commission.period_id === period.id);
      return {
        id: period.id,
        key: periodKey(period),
        year: period.year,
        semester: period.semester,
        commissionCount: own.length,
        studentCount: own.reduce((total, commission) => total + commission.student_count, 0),
        isActive: activeKey === periodKey(period),
        hasData: own.length > 0,
      };
    })
    .sort((a, b) => b.year - a.year || b.semester - a.semester);
}

/**
 * The active term wins when it has commissions. Otherwise the dashboard opens
 * the most recent term that does. When nothing has data, the newest term is
 * still a better starting point than an empty screen.
 */
export function pickDefaultPeriodKey(options: PeriodOption[]): string | null {
  const active = options.find((option) => option.isActive);
  if (active?.hasData) {
    return active.key;
  }

  const withData = options.find((option) => option.hasData);
  return withData?.key ?? options[0]?.key ?? null;
}

/**
 * Pending corrections are the deliveries the students already handed in and
 * the teacher has not corrected yet. Counting them client-side per commission
 * keeps the dashboard on the selected term: the summary endpoint is fixed to
 * the date-derived active term.
 */
export function countPendingByCommission(
  overviews: OverviewData[],
  commissionIds: Set<number>,
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const id of commissionIds) {
    counts[id] = 0;
  }

  for (const overview of overviews) {
    for (const row of overview.grid) {
      if (typeof row.commission_id !== "number" || !commissionIds.has(row.commission_id)) {
        continue;
      }
      for (const delivery of row.deliveries) {
        if (delivery.workflow_status === DeliveryWorkflowStatus.WAITING_FOR_CORRECTION) {
          counts[row.commission_id] += 1;
        }
      }
    }
  }

  return counts;
}
