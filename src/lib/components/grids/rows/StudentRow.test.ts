import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import StudentRow from "./StudentRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("StudentRow renders and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const student = { id: 1, commission_id: 1, name: "Student A", external_id: "" };
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(StudentRow, {
    target: tr,
    props: { student, onEdit, onDelete },
  });

  expect(screen.getAllByText("Student A")[0]).toBeDefined();

  // Test Edit
  const editBtn = document.body.querySelector('[data-test-id="edit-btn-1"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(student);

  // Test Delete
  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(student);
});
