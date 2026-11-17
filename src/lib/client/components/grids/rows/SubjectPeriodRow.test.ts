import { render, fireEvent } from "@testing-library/svelte";
import { loadTranslations } from "$lib/common/i18n/config";
import { expect, test, vi, afterEach } from "vitest";

import SubjectPeriodRow from "./SubjectPeriodRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("SubjectPeriodRow 'Materias' navigates to the period subjects and does not edit", async () => {
  await loadTranslations("es", "/");
  const period = { id: 2, subject_id: 1, year: 2025, semester: 2 };
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(SubjectPeriodRow, {
    target: tr,
    props: { period, facultySlug: "facultad-1", subjectSlug: "materia-1", onEdit, onDelete },
  });

  const subjectsLink = document.body.querySelector(
    '[data-test-id="manage-subjects-btn-2"]',
  ) as HTMLAnchorElement;

  expect(subjectsLink).not.toBeNull();
  expect(subjectsLink.tagName).toBe("A");
  expect(subjectsLink.getAttribute("href")).toBe("/periods/2025/2/subjects");
  expect(onEdit).not.toHaveBeenCalled();

  // The cursada's attendance lives next to its other views.
  const attendanceLink = document.body.querySelector(
    '[data-test-id="view-attendance-btn-2"]',
  ) as HTMLAnchorElement;
  expect(attendanceLink).not.toBeNull();
  expect(attendanceLink.getAttribute("href")).toBe(
    "/faculties/facultad-1/subjects/materia-1/periods/2025/2/attendance",
  );

  // Edit still opens the edit flow
  const editBtn = document.body.querySelector('[data-test-id="edit-btn-2"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(period);
});