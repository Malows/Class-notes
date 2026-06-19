import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import AssignmentTable from "./AssignmentTable.svelte";

test("AssignmentTable renders assignments and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const assignments = [{ id: 1, period_id: 1, title: "Test TP" }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(AssignmentTable, { assignments, onEdit, onDelete });

  expect(screen.getAllByText("Test TP")[0]).toBeDefined();

  // Test Edit
  const editButtons = screen.getAllByText("Editar");
  await fireEvent.click(editButtons[0]);
  expect(onEdit).toHaveBeenCalledWith(assignments[0]);

  // Test Delete
  const deleteButtons = screen.getAllByText("Eliminar");
  await fireEvent.click(deleteButtons[0]);
  expect(onDelete).toHaveBeenCalledWith(assignments[0]);
});
