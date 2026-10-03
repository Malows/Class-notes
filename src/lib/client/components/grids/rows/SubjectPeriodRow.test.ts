import { render, screen, fireEvent } from "@testing-library/svelte";
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
    props: { period, facultyId: 1, subjectId: 1, onEdit, onDelete },
  });

  const subjectsLink = document.body.querySelector(
    '[data-test-id="manage-subjects-btn-2"]',
  ) as HTMLAnchorElement;

  expect(subjectsLink).not.toBeNull();
  expect(subjectsLink.tagName).toBe("A");
  expect(subjectsLink.getAttribute("href")).toBe("/periods/2025/2/subjects");
  expect(onEdit).not.toHaveBeenCalled();

  // Edit still opens the edit flow
  const editBtn = document.body.querySelector('[data-test-id="edit-btn-2"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(period);
});