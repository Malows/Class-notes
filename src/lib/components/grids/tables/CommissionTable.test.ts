import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import CommissionTable from "./CommissionTable.svelte";

test("CommissionTable renders commissions and handles callbacks", async () => {
  await loadTranslations("es", "/");
  const commissions = [{ id: 1, period_id: 1, name: "Comm A", student_count: 5 }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(CommissionTable, {
    commissions,
    facultyId: 1,
    subjectId: 1,
    periodId: 1,
    onEdit,
    onDelete,
  });

  expect(screen.getAllByText("Comm A")[0]).toBeDefined();
  expect(screen.getAllByText("5")[0]).toBeDefined();

  // Test Edit
  const editButtons = screen.getAllByText("Editar");
  await fireEvent.click(editButtons[0]);
  expect(onEdit).toHaveBeenCalledWith(commissions[0]);

  // Test Delete
  const deleteButtons = screen.getAllByText("Borrar");
  await fireEvent.click(deleteButtons[0]);
  expect(onDelete).toHaveBeenCalledWith(commissions[0]);
});
