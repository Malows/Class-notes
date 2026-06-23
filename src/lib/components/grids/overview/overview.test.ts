import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import OverviewCell from "./OverviewCell.svelte";
import OverviewGrid from "./OverviewGrid.svelte";
import OverviewLegend from "./OverviewLegend.svelte";
import OverviewRow from "./OverviewRow.svelte";
import { DeliveryWorkflowStatus, getOverviewDeliveryStatus } from "$lib/types";

configure({ testIdAttribute: "data-test-id" });

describe("overview components", () => {
  test("getOverviewDeliveryStatus maps workflow states to overview statuses", () => {
    const pendingDelivery = getOverviewDeliveryStatus({
      assignment_id: 1,
      student_id: 1,
      grade: 0,
      ai_level: 0,
      comments: "",
      workflow_status: DeliveryWorkflowStatus.WAITING_FOR_STUDENTS,
    });

    const pendingCorrection = getOverviewDeliveryStatus({
      assignment_id: 1,
      student_id: 1,
      grade: 0,
      ai_level: 0,
      comments: "",
      workflow_status: DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
    });

    expect(pendingDelivery).toBe("pending_delivery");
    expect(pendingCorrection).toBe("pending_correction");
  });

  test("OverviewCell renders approved state and AI icon", () => {
    render(OverviewCell, {
      href: "/correct",
      status: "approved",
      aiLevel: 2,
      label: "approved",
      testId: "approved-cell",
    });

    const cell = screen.getByTestId("approved-cell");
    expect(cell).toHaveAttribute("href", "/correct");
    expect(cell).toHaveClass("btn-success");
    expect(cell).toHaveAttribute("aria-label", "approved");
    expect(cell.textContent?.trim()).toBe("🤖");
  });

  test("OverviewRow renders the student name and delivery cells", () => {
    const deliveries = [
      {
        assignment_id: 1,
        student_id: 7,
        grade: 10,
        ai_level: 0,
        comments: "",
        workflow_status: DeliveryWorkflowStatus.APPROVED,
      },
      {
        assignment_id: 2,
        student_id: 7,
        grade: 0,
        ai_level: 0,
        comments: "",
        workflow_status: DeliveryWorkflowStatus.NOT_DICTATED,
      },
    ];

    render(OverviewRow, {
      name: "A very long student name that should ellipsize",
      deliveries,
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    const nameEl = screen.getByTestId("overview-row-student-name");
    expect(nameEl).toBeInTheDocument();
    expect(nameEl.textContent).toBe("A very long student name that should ellipsize");

    const cell1 = screen.getByTestId("delivery-cell-7-1");
    const cell2 = screen.getByTestId("delivery-cell-7-2");

    expect(cell1).toBeInTheDocument();
    expect(cell1.textContent?.trim()).toBe("✅");

    expect(cell2).toBeInTheDocument();
    expect(cell2.textContent?.trim()).toBe("-");
  });

  test("OverviewGrid renders assignment headers and student rows", () => {
    const assignments = [{ id: 1, period_id: 1, title: "T 1" }];
    const grid = [
      {
        id: 1,
        name: "Student A",
        deliveries: [
          {
            assignment_id: 1,
            student_id: 1,
            grade: 10,
            ai_level: 0,
            comments: "",
            workflow_status: DeliveryWorkflowStatus.APPROVED,
          },
        ],
      },
    ];

    render(OverviewGrid, {
      assignments,
      grid,
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    // Verify OverviewHeader and OverviewRow exist by their respective test IDs
    expect(screen.getByTestId("overview-header")).toBeInTheDocument();
    expect(screen.getByTestId("overview-header-students-title")).toBeInTheDocument();
    expect(screen.getByTestId("overview-header-assignment-title-1")).toBeInTheDocument();
    expect(screen.getByTestId("correct-assignment-btn-1")).toBeInTheDocument();

    expect(screen.getByTestId("overview-row")).toBeInTheDocument();
    expect(screen.getByTestId("overview-row-student-name")).toBeInTheDocument();
    expect(screen.getByTestId("delivery-cell-1-1")).toBeInTheDocument();
  });

  test("OverviewLegend renders the popover trigger", () => {
    render(OverviewLegend, { title: "Legend" });

    const button = screen.getByTestId("overview-legend-popover-btn");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-popover-position", "bottom");
    expect(button).toHaveAttribute("data-popover-content");
  });

  test("OverviewGrid renders empty assignments card and CTA", () => {
    render(OverviewGrid, {
      assignments: [],
      grid: [{ id: 1, name: "Student A", deliveries: [] }],
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    const card = screen.getByTestId("empty-assignments-card");
    expect(card).toBeInTheDocument();

    const cta = screen.getByTestId("empty-assignments-cta");
    expect(cta).toHaveAttribute("href", "/faculties/1/subjects/2/periods/3/assignments");
  });

  test("OverviewGrid renders empty students card and CTA", () => {
    const assignments = [{ id: 1, period_id: 3, title: "Lab 1" }];

    render(OverviewGrid, {
      assignments,
      grid: [],
      facultyId: 1,
      subjectId: 2,
      periodId: 3,
      commissionId: 4,
    });

    const card = screen.getByTestId("empty-students-card");
    expect(card).toBeInTheDocument();

    const cta = screen.getByTestId("empty-students-cta");
    expect(cta).toHaveAttribute("href", "/faculties/1/subjects/2/periods/3/commissions/4/students");
  });
});
