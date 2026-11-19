import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import OverviewCell from "./OverviewCell.svelte";
import OverviewGrid from "./OverviewGrid.svelte";
import OverviewLegend from "./OverviewLegend.svelte";
import OverviewRow from "./OverviewRow.svelte";
import {
  DeliveryWorkflowStatus,
  getOverviewDeliveryStatus,
  type OverviewDeliveryStatus,
} from "$lib/common";

configure({ testIdAttribute: "data-test-id" });

describe("overview components", () => {
  test("getOverviewDeliveryStatus maps workflow states to overview statuses", () => {
    const pendingDelivery = getOverviewDeliveryStatus({
      assignment_id: 1,
      enrollment_id: 1,
      grade: 0,
      ai_level: 0,
      comments: "",
      workflow_status: DeliveryWorkflowStatus.WAITING_FOR_STUDENTS,
    });

    const pendingCorrection = getOverviewDeliveryStatus({
      assignment_id: 1,
      enrollment_id: 1,
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
      status: "approved" as OverviewDeliveryStatus,
      aiLevel: 2,
      label: "approved",
      testId: "approved-cell",
    });

    const cell = screen.getByTestId("approved-cell");
    expect(cell).toHaveAttribute("href", "/correct");
    expect(cell).toHaveAttribute("data-status", "approved");
    expect(cell).toHaveClass("is-approved");
    expect(cell).toHaveAttribute("aria-label", "approved");
    expect(cell.textContent).toContain("✅");
    expect(cell.textContent).toContain("IA!!");
  });

  test("the AI mark is a separate, decorative chip inside the cell", () => {
    const { container } = render(OverviewCell, {
      status: "approved" as OverviewDeliveryStatus,
      aiLevel: 2,
      label: "approved",
      testId: "ai-cell",
    });

    const cell = screen.getByTestId("ai-cell");
    const chip = container.querySelector(".overview-cell__ai");
    expect(chip).not.toBeNull();
    expect(chip).toHaveAttribute("aria-hidden", "true");
    expect(chip?.textContent).toBe("IA!!");
    expect(cell).toHaveAttribute("aria-label", "approved");
    expect(cell.querySelector(".overview-cell__status")?.textContent).toBe("✅");

    const noMark = render(OverviewCell, {
      status: "pending_delivery" as OverviewDeliveryStatus,
      aiLevel: 0,
      testId: "no-ai-cell",
    });
    expect(noMark.container.querySelector(".overview-cell__ai")).toBeNull();
  });

  test("OverviewRow renders the student name and delivery cells", async () => {
    await loadTranslations("en", "/");
    const deliveries = [
      {
        assignment_id: 1,
        enrollment_id: 7,
        grade: 10,
        ai_level: 0,
        comments: "",
        workflow_status: DeliveryWorkflowStatus.APPROVED,
      },
      {
        assignment_id: 2,
        enrollment_id: 7,
        grade: 0,
        ai_level: 0,
        comments: "",
        workflow_status: DeliveryWorkflowStatus.NOT_DICTATED,
      },
    ];

    render(OverviewRow, {
      name: "A very long student name that should ellipsize",
      deliveries,
      assignments: [
        { id: 1, subject_period_id: 1, title: "TP 1" },
        { id: 2, subject_period_id: 1, title: "TP 2" },
      ],
      facultySlug: "fac-1",
      subjectSlug: "sub-2",
      periodYear: 2026,
      periodSemester: 1,
      commissionSlug: "comision-a",
    });

    const nameEl = screen.getByTestId("overview-row-student-name");
    expect(nameEl).toBeInTheDocument();
    expect(nameEl.textContent).toBe("A very long student name that should ellipsize");

    const cell1 = screen.getByTestId("delivery-cell-7-1");
    const cell2 = screen.getByTestId("delivery-cell-7-2");

    expect(cell1).toBeInTheDocument();
    expect(cell1.textContent?.trim()).toBe("✅");
    expect(cell1).toHaveAttribute(
      "aria-label",
      "Approved · A very long student name that should ellipsize — TP 1",
    );

    expect(cell2).toBeInTheDocument();
    expect(cell2.textContent?.trim()).toBe("-");
  });

  test("OverviewGrid renders assignment headers and student rows", () => {
    const assignments = [{ id: 1, subject_period_id: 1, title: "T 1" }];
    const grid = [
      {
        id: 1,
        enrollment_id: 1,
        name: "Student A",
        deliveries: [
          {
            assignment_id: 1,
            enrollment_id: 1,
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
      facultySlug: "fac-1",
      subjectSlug: "sub-2",
      periodYear: 2026,
      periodSemester: 1,
      commissionSlug: "comision-a",
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

  test("OverviewLegend renders a working disclosure with the legend text", async () => {
    await loadTranslations("en", "/");
    render(OverviewLegend);

    const toggle = screen.getByTestId("overview-legend-toggle");
    expect(toggle).toBeInTheDocument();
    expect(toggle.textContent?.trim()).toBe("Legend:");

    const details = screen.getByTestId("overview-legend");
    expect(details.tagName).toBe("DETAILS");
    expect(screen.getByTestId("overview-legend-text").textContent).toContain("Approved");
  });

  test("OverviewGrid renders empty assignments card and CTA", () => {
    render(OverviewGrid, {
      assignments: [],
      grid: [{ id: 1, enrollment_id: 1, name: "Student A", deliveries: [] }],
      facultySlug: "fac-1",
      subjectSlug: "sub-2",
      periodYear: 2026,
      periodSemester: 1,
      commissionSlug: "comision-a",
    });

    const card = screen.getByTestId("empty-assignments-card");
    expect(card).toBeInTheDocument();

    const cta = screen.getByTestId("empty-assignments-cta");
    expect(cta).toHaveAttribute(
      "href",
      "/faculties/fac-1/subjects/sub-2/periods/2026/1/assignments",
    );
  });

  test("OverviewGrid renders empty students card and CTA", () => {
    const assignments = [{ id: 1, subject_period_id: 3, title: "Lab 1" }];

    render(OverviewGrid, {
      assignments,
      grid: [],
      facultySlug: "fac-1",
      subjectSlug: "sub-2",
      periodYear: 2026,
      periodSemester: 1,
      commissionSlug: "comision-a",
    });

    const card = screen.getByTestId("empty-students-card");
    expect(card).toBeInTheDocument();

    const cta = screen.getByTestId("empty-students-cta");
    expect(cta).toHaveAttribute(
      "href",
      "/faculties/fac-1/subjects/sub-2/periods/2026/1/commissions/comision-a/students",
    );
  });

  test("cursada cells return to the commission of their own row", () => {
    const assignments = [{ id: 1, subject_period_id: 1, title: "TP 1" }];
    const delivery = (enrollmentId: number) => ({
      assignment_id: 1,
      enrollment_id: enrollmentId,
      grade: 0,
      ai_level: 0,
      comments: "",
      workflow_status: DeliveryWorkflowStatus.APPROVED,
    });
    const grid = [
      { id: 1, enrollment_id: 1, name: "Ana", commission_id: 1, deliveries: [delivery(1)] },
      { id: 2, enrollment_id: 2, name: "Beto", deliveries: [delivery(2)] },
    ];

    render(OverviewGrid, {
      assignments,
      grid,
      facultySlug: "fac-1",
      subjectSlug: "sub-2",
      periodYear: 2026,
      periodSemester: 1,
      commissionSlug: "",
      commissions: [{ id: 1, slug: "comision-manana" }],
    });

    const linked = screen.getByTestId("delivery-cell-1-1");
    expect(linked.tagName).toBe("A");
    expect(linked.getAttribute("href")).toBe(
      "/faculties/fac-1/subjects/sub-2/periods/2026/1/commissions/comision-manana/correct?assignment_id=1&enrollment_id=1&mode=single",
    );

    const withoutCommission = screen.getByTestId("delivery-cell-2-1");
    expect(withoutCommission.tagName).not.toBe("A");
    expect(withoutCommission.getAttribute("href")).toBeNull();
  });
});
