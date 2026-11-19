import { loadTranslations } from "$lib/common/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import CommissionTable from "./CommissionTable.svelte";

test("CommissionTable renders commissions and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const commissions = [{ id: 1, subject_id: 1, period_id: 1, name: "Comm A", slug: "comm-a", student_count: 5 }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(CommissionTable, {
    commissions,
    facultySlug: "facultad-1",
    subjectSlug: "materia-1",
    periodYear: 2026,
    periodSemester: 1,
    onEdit,
    onDelete,
  });

  expect(screen.getAllByText("Comm A")[0]).toBeDefined();
  expect(screen.getAllByText("5")[0]).toBeDefined();

  // Attendance is the visible primary action on the card too, with the
  // overview next to it and the roster behind the disclosure.
  const mobileAttendance = document.body.querySelector(
    '[data-test-id="mobile-view-attendance-btn-1"]',
  ) as HTMLAnchorElement;
  expect(mobileAttendance.className).toContain("btn-primary");
  expect(mobileAttendance.getAttribute("href")).toContain("/attendance");

  const mobileOverview = document.body.querySelector(
    '[data-test-id="mobile-view-overview-btn-1"]',
  ) as HTMLAnchorElement;
  expect(mobileOverview.getAttribute("href")).toContain("/overview");

  const mobileStudents = document.body.querySelector(
    '[data-test-id="mobile-view-students-btn-1"]',
  ) as HTMLAnchorElement;
  expect(mobileStudents.getAttribute("href")).toContain("/students");
  expect(mobileStudents.closest("details")?.getAttribute("data-test-id")).toBe(
    "commission-card-actions-1",
  );

  document.body
    .querySelectorAll("details")
    .forEach((details) => ((details as HTMLDetailsElement).open = true));

  // Test Edit
  const editButtons = screen.getAllByText("Editar");
  await fireEvent.click(editButtons[0]);
  expect(onEdit).toHaveBeenCalledWith(commissions[0]);

  // Test Delete
  const deleteButtons = screen.getAllByText("Borrar");
  await fireEvent.click(deleteButtons[0]);
  expect(onDelete).toHaveBeenCalledWith(commissions[0]);
});
