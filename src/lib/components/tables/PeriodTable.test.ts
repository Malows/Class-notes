import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import PeriodTable from "./PeriodTable.svelte";

test("PeriodTable renders academic periods and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const periods = [{ id: 1, subject_id: 1, year: 2026, semester: 1 }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(PeriodTable, {
    periods,
    facultyId: 1,
    subjectId: 1,
    onEdit,
    onDelete,
  });

  expect(screen.getAllByText("2026")[0]).toBeDefined();
  expect(screen.getAllByText("1º")[0]).toBeDefined();

  // Test Edit
  const editButtons = screen.getAllByText("Editar");
  await fireEvent.click(editButtons[0]);
  expect(onEdit).toHaveBeenCalledWith(periods[0]);

  // Test Delete
  const deleteButtons = screen.getAllByText("Borrar");
  await fireEvent.click(deleteButtons[0]);
  expect(onDelete).toHaveBeenCalledWith(periods[0]);
});
