import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import OverviewHeaderCell from "./OverviewHeaderCell.svelte";

configure({ testIdAttribute: "data-test-id" });

describe("OverviewHeaderCell Component", () => {
  test("renders abbreviated title, native tooltip, and pencil link", () => {
    const assignment = { id: 12, period_id: 1, title: "Lab Exercise 10", subtitle: "Maths" };

    render(OverviewHeaderCell, {
      assignment,
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    const titleEl = screen.getByTestId("overview-header-assignment-title-12");
    expect(titleEl).toBeInTheDocument();
    expect(titleEl).toHaveAttribute("title", "Lab Exercise 10 — Maths");
    expect(titleEl.textContent?.trim()).toBe("LE10");

    const link = screen.getByTestId("correct-assignment-btn-12");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/faculties/1/subjects/2/periods/3/commissions/4/correct?assignment_id=12",
    );
  });
});
