import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import CommissionRow from "./CommissionRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("CommissionRow renders and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const commission = { id: 1, period_id: 1, name: "Comm A", student_count: 5 };
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
      facultyId: 1,
      subjectId: 1,
      periodId: 1,
      onEdit,
      onDelete,
    },
  });

  expect(screen.getAllByText("Comm A")[0]).toBeDefined();
  expect(screen.getAllByText("5")[0]).toBeDefined();

  // Test Edit
  const editBtn = document.body.querySelector('[data-test-id="edit-btn-1"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(commission);

  // Test Delete
  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(commission);
});
