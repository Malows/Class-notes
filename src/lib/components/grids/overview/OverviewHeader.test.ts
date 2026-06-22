import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import OverviewHeader from "./OverviewHeader.svelte";

describe("OverviewHeader Component", () => {
  test("renders students label and dynamic assignment columns with pencil emoji links", () => {
    const assignments = [
      { id: 10, period_id: 1, title: "Lab 1" },
      { id: 20, period_id: 1, title: "Lab 2" },
    ];

    render(OverviewHeader, {
      assignments,
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    // Verify Row 1: Left column
    expect(screen.getByText("Students")).toBeInTheDocument();

    // Verify Row 1: Right columns (assignments)
    expect(screen.getByText("Lab 1")).toBeInTheDocument();
    expect(screen.getByText("Lab 2")).toBeInTheDocument();

    // Verify Row 2: Right columns (✏️ links with exact href parameters)
    const links = screen.getAllByText("✏️");
    expect(links).toHaveLength(2);

    expect(links[0].closest("a")).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=10",
    );
    expect(links[1].closest("a")).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=20",
    );
  });
});
