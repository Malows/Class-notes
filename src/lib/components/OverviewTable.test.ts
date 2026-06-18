import { render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";

import OverviewTable from "./OverviewTable.svelte";

test("OverviewTable renders data", () => {
  const data = {
    assignments: [{ id: 1, period_id: 1, title: "TP1" }],
    grid: [
      {
        id: 1,
        name: "Student A",
        deliveries: [
          {
            assignment_id: 1,
            student_id: 1,
            is_delivered: true,
            is_approved: true,
            grade: 10,
            ai_level: 0,
            comments: "",
          },
        ],
      },
    ],
  };

  render(OverviewTable, { data, commissionID: 1 });

  expect(screen.getByText("TP1")).toBeDefined();
  expect(screen.getByText("Student A")).toBeDefined();
});
