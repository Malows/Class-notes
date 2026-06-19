import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import SubjectTable from "./SubjectTable.svelte";

test("SubjectTable renders subjects and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const subjects = [{ id: 1, faculty_id: 1, name: "Materia A", faculty_name: "Facultad A" }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(SubjectTable, { subjects, onEdit, onDelete });

  expect(screen.getAllByText("Materia A")[0]).toBeDefined();
  expect(screen.getAllByText("Facultad A")[0]).toBeDefined();

  // Test Edit
  const editButtons = screen.getAllByText("Editar");
  await fireEvent.click(editButtons[0]);
  expect(onEdit).toHaveBeenCalledWith(subjects[0]);

  // Test Delete
  const deleteButtons = screen.getAllByText("Borrar");
  await fireEvent.click(deleteButtons[0]);
  expect(onDelete).toHaveBeenCalledWith(subjects[0]);
});
