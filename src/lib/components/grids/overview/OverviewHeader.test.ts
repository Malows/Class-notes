import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import OverviewHeader from "./OverviewHeader.svelte";

describe("OverviewHeader Component", () => {
  test("renders students label and dynamic abbreviated assignment columns with pencil emoji links", () => {
    const assignments = [
      { id: 10, period_id: 1, title: "Lab 1" },
      { id: 20, period_id: 1, title: "Lab Exercise 12" },
      { id: 30, period_id: 1, title: "Discrete Mathematics" },
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

    // Verify Row 1: Right columns with abbreviations
    // "Lab 1" -> "L1"
    expect(screen.getByText("L1")).toBeInTheDocument();
    // "Lab Exercise 12" -> "LE12"
    expect(screen.getByText("LE12")).toBeInTheDocument();
    // "Discrete Mathematics" -> "DM"
    expect(screen.getByText("DM")).toBeInTheDocument();

    // Verify Row 2: Right columns (✏️ links with exact href parameters)
    const links = screen.getAllByText("✏️");
    expect(links).toHaveLength(3);

    expect(links[0].closest("a")).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=10",
    );
    expect(links[1].closest("a")).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=20",
    );
    expect(links[2].closest("a")).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=30",
    );
  });
});
