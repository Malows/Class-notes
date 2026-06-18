import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import PeriodRow from "./PeriodRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("PeriodRow renders and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const period = { id: 1, subject_id: 1, year: 2026, semester: 1 };
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(PeriodRow, {
    target: tr,
    props: {
      period,
      facultyId: 1,
      subjectId: 1,
      onEdit,
      onDelete,
    },
  });

  expect(screen.getAllByText("2026")[0]).toBeDefined();
  expect(screen.getAllByText("1º")[0]).toBeDefined();

  // Test Edit
  const editBtn = document.body.querySelector('[data-test-id="edit-btn-1"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(period);

  // Test Delete
  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(period);
});
