import { loadTranslations } from "$lib/common/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

import StudentTable from "./StudentTable.svelte";

test("StudentTable renders enrollments and calls onDelete", async () => {
  await loadTranslations("es", "/");
  const enrollments = [
    {
      id: 1,
      person_id: 7,
      subject_period_id: 1,
      commission_id: 1,
      name: "Student A",
      legajo: "LEG-007",
    },
  ];
  const onDelete = vi.fn();

  render(StudentTable, { enrollments, onDelete });

  expect(screen.getAllByText("Student A")[0]).toBeDefined();
  expect(document.body.querySelector('[data-test-id="edit-btn-1"]')).toBeNull();

  // The card's destructive action lives behind its disclosure, not as a
  // full-width button on the card.
  const disclosure = document.body.querySelector(
    '[data-test-id="student-card-actions-1"]',
  ) as HTMLDetailsElement;
  expect(disclosure).not.toBeNull();
  expect(disclosure.open).toBe(false);

  const deleteBtn = document.body.querySelector(
    '[data-test-id="mobile-delete-btn-1"]',
  ) as HTMLElement;
  expect(deleteBtn.closest("details")).toBe(disclosure);

  disclosure.open = true;
  await fireEvent.click(deleteBtn);

  expect(onDelete).toHaveBeenCalledWith(enrollments[0]);
});
