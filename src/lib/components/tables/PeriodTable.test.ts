import { render, screen } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import PeriodTable from "./PeriodTable.svelte";

test("PeriodTable renders academic periods", async () => {
  await loadTranslations("es", "/");
  const periods = [{ id: 1, subject_id: 1, year: 2026, semester: 1 }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(PeriodTable, { periods, facultyId: 1, subjectId: 1, onEdit, onDelete });

  expect(screen.getAllByText("2026")[0]).toBeDefined();
  expect(screen.getAllByText("1º")[0]).toBeDefined();
});
