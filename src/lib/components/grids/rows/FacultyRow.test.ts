import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import FacultyRow from "./FacultyRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("FacultyRow renders and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const faculty = { id: 1, name: "Faculty A" };
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(FacultyRow, {
    target: tr,
    props: { faculty, onEdit, onDelete },
  });

  expect(screen.getAllByText("1")[0]).toBeDefined();
  expect(screen.getAllByText("Faculty A")[0]).toBeDefined();

  // Test Edit
  const editBtn = document.body.querySelector('[data-test-id="edit-btn-1"]') as HTMLElement;
  await fireEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith(faculty);

  // Test Delete
  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(faculty);
});
