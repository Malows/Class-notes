import { describe, expect, test } from "vitest";

import type { Commission, Period } from "$lib/common/types/academic";
import type { OverviewData } from "$lib/common/types/dashboard";
import type { Delivery } from "$lib/common/types/student";
import { DeliveryWorkflowStatus } from "$lib/common/types/student";

import {
  buildPeriodOptions,
  countPendingByCommission,
  pickDefaultPeriodKey,
} from "./dashboard-model";

const periods: Period[] = [
  { id: 5, year: 2026, semester: 2 },
  { id: 4, year: 2026, semester: 1 },
  { id: 2, year: 2025, semester: 1 },
];

const commissions: Commission[] = [
  { id: 4, period_id: 4, subject_id: 3, name: "Comisión Virtual", slug: "comision-virtual", student_count: 4 },
  { id: 10, period_id: 4, subject_id: 7, name: "Comisión Taller", slug: "comision-taller", student_count: 2 },
  { id: 1, period_id: 2, subject_id: 1, name: "Comisión Mañana", slug: "comision-manana", student_count: 4 },
];

function delivery(workflow_status: DeliveryWorkflowStatus): Delivery {
  return {
    assignment_id: 1,
    enrollment_id: 1,
    workflow_status,
    grade: 0,
    ai_level: 0,
    comments: "",
  };
}

describe("buildPeriodOptions", () => {
  test("counts commissions and students per term and keeps the newest first", () => {
    const options = buildPeriodOptions(periods, commissions, "2026-2");

    expect(options.map((option) => option.key)).toEqual(["2026-2", "2026-1", "2025-1"]);
    expect(options[2]).toMatchObject({ commissionCount: 1, studentCount: 4, hasData: true });
    expect(options[0]).toMatchObject({ commissionCount: 0, hasData: false, isActive: true });
    expect(options[1]).toMatchObject({ commissionCount: 2, studentCount: 6 });
  });
});

describe("pickDefaultPeriodKey", () => {
  const options = buildPeriodOptions(periods, commissions, "2026-2");

  test("prefers the active term when it has commissions", () => {
    const activeWithData = options.map((option) =>
      option.key === "2026-2" ? { ...option, hasData: true } : option,
    );
    expect(pickDefaultPeriodKey(activeWithData)).toBe("2026-2");
  });

  test("falls back to the most recent term with data when the active one is empty", () => {
    expect(pickDefaultPeriodKey(options)).toBe("2026-1");
  });

  test("still opens the newest term when nothing has data", () => {
    const empty = options.map((option) => ({ ...option, hasData: false, commissionCount: 0 }));
    expect(pickDefaultPeriodKey(empty)).toBe("2026-2");
    expect(pickDefaultPeriodKey([])).toBeNull();
  });
});

describe("countPendingByCommission", () => {
  const overview = (rows: OverviewData["grid"]): OverviewData => ({ assignments: [], grid: rows });

  test("counts only delivered work waiting for correction, per commission", () => {
    const overviews = [
      overview([
        {
          id: 1,
          enrollment_id: 1,
          name: "Ana",
          commission_id: 4,
          deliveries: [
            delivery(DeliveryWorkflowStatus.WAITING_FOR_CORRECTION),
            delivery(DeliveryWorkflowStatus.APPROVED),
          ],
        },
        {
          id: 2,
          enrollment_id: 2,
          name: "Bruno",
          commission_id: 4,
          deliveries: [
            delivery(DeliveryWorkflowStatus.WAITING_FOR_CORRECTION),
            delivery(DeliveryWorkflowStatus.WAITING_FOR_STUDENTS),
          ],
        },
        {
          id: 3,
          enrollment_id: 3,
          name: "Carla",
          commission_id: 10,
          deliveries: [delivery(DeliveryWorkflowStatus.NOT_DICTATED)],
        },
        {
          id: 4,
          enrollment_id: 4,
          name: "Dante",
          commission_id: undefined,
          deliveries: [delivery(DeliveryWorkflowStatus.WAITING_FOR_CORRECTION)],
        },
      ]),
    ];

    expect(countPendingByCommission(overviews, new Set([4, 10, 99]))).toEqual({
      4: 2,
      10: 0,
      99: 0,
    });
  });
});
