import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import OverviewHeader from "./OverviewHeader.svelte";

configure({ testIdAttribute: "data-test-id" });

describe("OverviewHeader Component", () => {
  test("renders students label and dynamic abbreviated assignment columns with pencil emoji links and standard titles", () => {
    const assignments = [
      { id: 10, period_id: 1, title: "Lab 1", subtitle: "" },
      { id: 20, period_id: 1, title: "Lab Exercise 12", subtitle: "Physics II" },
      { id: 30, period_id: 1, title: "Discrete Mathematics", subtitle: undefined },
    ];

    render(OverviewHeader, {
      assignments,
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    // Verify Row 1: Left column by test id
    const studentsTitle = screen.getByTestId("overview-header-students-title");
    expect(studentsTitle).toBeInTheDocument();
    expect(studentsTitle.textContent).toBe("Students");

    // Verify Row 1: Right columns with abbreviations and titles by test ids
    // "Lab 1" -> "L1"
    const l1Header = screen.getByTestId("overview-header-assignment-title-10");
    expect(l1Header).toBeInTheDocument();
    expect(l1Header).toHaveAttribute("title", "Lab 1");
    expect(l1Header.textContent?.trim()).toBe("L1");

    // "Lab Exercise 12" -> "LE12" (with subtitle "Physics II")
    const le12Header = screen.getByTestId("overview-header-assignment-title-20");
    expect(le12Header).toBeInTheDocument();
    expect(le12Header).toHaveAttribute("title", "Lab Exercise 12 — Physics II");
    expect(le12Header.textContent?.trim()).toBe("LE12");

    // "Discrete Mathematics" -> "DM"
    const dmHeader = screen.getByTestId("overview-header-assignment-title-30");
    expect(dmHeader).toBeInTheDocument();
    expect(dmHeader).toHaveAttribute("title", "Discrete Mathematics");
    expect(dmHeader.textContent?.trim()).toBe("DM");

    // Verify Row 2: Right columns (✏️ links with exact href parameters)
    const link1 = screen.getByTestId("correct-assignment-btn-10");
    const link2 = screen.getByTestId("correct-assignment-btn-20");
    const link3 = screen.getByTestId("correct-assignment-btn-30");

    expect(link1).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=10",
    );
    expect(link2).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=20",
    );
    expect(link3).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=30",
    );
  });
});
