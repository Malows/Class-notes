import { render, screen } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import FacultyTable from "./FacultyTable.svelte";

test("FacultyTable renders faculties", async () => {
  await loadTranslations("es", "/");
  const faculties = [{ id: 1, name: "Facultad A" }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(FacultyTable, { faculties, onEdit, onDelete });

  expect(screen.getAllByText("Facultad A")[0]).toBeDefined();
  expect(screen.getAllByText("1")[0]).toBeDefined();
});
