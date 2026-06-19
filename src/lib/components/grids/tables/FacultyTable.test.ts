import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import FacultyTable from "./FacultyTable.svelte";

test("FacultyTable renders faculties and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const faculties = [{ id: 1, name: "Facultad A" }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(FacultyTable, { faculties, onEdit, onDelete });

  expect(screen.getAllByText("Facultad A")[0]).toBeDefined();
  expect(screen.getAllByText("1")[0]).toBeDefined();

  // Test Edit
  const editButtons = screen.getAllByText("Editar");
  await fireEvent.click(editButtons[0]);
  expect(onEdit).toHaveBeenCalledWith(faculties[0]);

  // Test Delete
  const deleteButtons = screen.getAllByText("Borrar");
  await fireEvent.click(deleteButtons[0]);
  expect(onDelete).toHaveBeenCalledWith(faculties[0]);
});
