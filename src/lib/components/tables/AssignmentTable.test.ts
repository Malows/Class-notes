import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import AssignmentTable from "./AssignmentTable.svelte";

test("AssignmentTable renders assignments and calls onDelete", async () => {
  await loadTranslations("es", "/");
  const assignments = [{ id: 1, period_id: 1, title: "Test TP" }];
  const onDelete = vi.fn();

  render(AssignmentTable, { assignments, onDelete });

  expect(screen.getAllByText("Test TP")[0]).toBeDefined();
  const deleteButtons = screen.getAllByText("Eliminar");
  await fireEvent.click(deleteButtons[0]);

  expect(onDelete).toHaveBeenCalledWith(1);
});
