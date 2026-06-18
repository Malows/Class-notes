import { loadTranslations } from "$lib/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import AssignmentRow from "./AssignmentRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("AssignmentRow renders and handles onDelete", async () => {
  await loadTranslations("es", "/");
  const assignment = { id: 1, period_id: 1, title: "Test TP" };
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(AssignmentRow, {
    target: tr,
    props: { assignment, onDelete },
  });

  expect(screen.getAllByText("Test TP")[0]).toBeDefined();
  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);

  expect(onDelete).toHaveBeenCalledWith(assignment);
});
