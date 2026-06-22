import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import OverviewCell from "./OverviewCell.svelte";
import OverviewGrid from "./OverviewGrid.svelte";
import OverviewLegend from "./OverviewLegend.svelte";
import OverviewRow from "./OverviewRow.svelte";
import { DeliveryWorkflowStatus, getOverviewDeliveryStatus } from "$lib/types";

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

    const cell = screen.getByText("🤖").closest("a");
    expect(cell).toHaveAttribute("href", "/correct");
    expect(cell).toHaveClass("btn-success");
    expect(cell).toHaveAttribute("aria-label", "approved");
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

    expect(screen.getByText("A very long student name that should ellipsize")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("OverviewGrid renders assignment headers and student rows", () => {
    const assignments = [{ id: 1, period_id: 1, title: "TP1" }];
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

    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("TP1")).toBeInTheDocument();
    expect(screen.getByText("Student A")).toBeInTheDocument();
    expect(screen.getByText("✏️")).toBeInTheDocument();
  });

  test("OverviewLegend renders the popover trigger", () => {
    render(OverviewLegend, { title: "Legend" });

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-popover-position", "bottom");
    expect(button).toHaveAttribute("data-popover-content");
  });
});
