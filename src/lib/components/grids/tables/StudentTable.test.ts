import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import StudentTable from "./StudentTable.svelte";

test("StudentTable renders students and calls onDelete", async () => {
  await loadTranslations("es", "/");
  const students = [{ id: 1, commission_id: 1, name: "Student A", external_id: "" }];
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(StudentTable, { students, onEdit, onDelete });

  expect(screen.getAllByText("Student A")[0]).toBeDefined();
  const deleteButtons = screen.getAllByText("Borrar");
  await fireEvent.click(deleteButtons[0]);

  expect(onDelete).toHaveBeenCalledWith(students[0]);
});
