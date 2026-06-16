import { render, screen } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import SubjectTable from "../SubjectTable.svelte";

test("SubjectTable renders subjects", async () => {
  await loadTranslations("es", "/");
  const subjects = [{ id: 1, faculty_id: 1, name: "Materia A", faculty_name: "Facultad A" }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(SubjectTable, { subjects, onEdit, onDelete });

  expect(screen.getAllByText("Materia A")[0]).toBeDefined();
  expect(screen.getAllByText("Facultad A")[0]).toBeDefined();
});
