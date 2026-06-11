import { render, screen } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import CommissionTable from "./CommissionTable.svelte";

test("CommissionTable renders commissions", async () => {
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
});
