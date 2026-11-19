import { loadTranslations } from "$lib/common/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import CommissionRow from "./CommissionRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("CommissionRow renders and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const commission = { id: 1, subject_id: 1, period_id: 1, name: "Comm A", slug: "comm-a", student_count: 5 };
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(CommissionRow, {
    target: tr,
    props: {
      commission,
      facultySlug: "facultad-1",
      subjectSlug: "materia-1",
      periodYear: 2026,
      periodSemester: 1,
      onEdit,
      onDelete,
    },
  });

  expect(screen.getAllByText("Comm A")[0]).toBeDefined();
  expect(screen.getAllByText("5")[0]).toBeDefined();

  // Test Edit
  const attendanceBtn = document.body.querySelector(
    '[data-test-id="view-attendance-btn-1"]',
  ) as HTMLAnchorElement;
  expect(attendanceBtn.getAttribute("href")).toContain("/attendance");

  // Edit and delete live inside the row disclosure.
  const disclosure = document.body.querySelector(
    '[data-test-id="row-actions-1"]',
  ) as HTMLDetailsElement;
  expect(disclosure).not.toBeNull();
  disclosure.open = true;

  // One direct primary action, the rest behind the disclosure.
  const primary = disclosure.parentElement?.querySelector(".row-actions__primary");
  expect(primary?.querySelectorAll("a, button")).toHaveLength(1);

  const summary = disclosure.querySelector("summary");
  expect(summary?.getAttribute("aria-label")).toContain("Más acciones");
  expect(disclosure.querySelector(".row-actions__separator")).not.toBeNull();

  const editBtn = document.body.querySelector('[data-test-id="edit-btn-1"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(commission);

  // Test Delete
  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(commission);
});
