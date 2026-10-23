import { loadTranslations } from "$lib/common/i18n/config";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi, afterEach } from "vitest";

import StudentRow from "./StudentRow.svelte";

afterEach(() => {
  document.body.innerHTML = "";
});

test("StudentRow links to the person and only offers removing the enrollment", async () => {
  await loadTranslations("es", "/");
  const enrollment = {
    id: 1,
    person_id: 7,
    subject_period_id: 1,
    commission_id: 1,
    name: "Student A",
    legajo: "LEG-007",
  };
  const onDelete = vi.fn();

  const table = document.createElement("table");
  const tr = document.createElement("tr");
  table.appendChild(tr);
  document.body.appendChild(table);

  render(StudentRow, {
    target: tr,
    props: { enrollment, onDelete },
  });

  expect(screen.getAllByText("Student A")[0]).toBeDefined();
  expect(screen.getAllByText("LEG-007")[0]).toBeDefined();

  const link = document.body.querySelector(
    '[data-test-id="student-person-link-1"]',
  ) as HTMLAnchorElement;
  expect(link.getAttribute("href")).toBe("/persons/7");

  expect(document.body.querySelector('[data-test-id="edit-btn-1"]')).toBeNull();

  const deleteBtn = document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLElement;
  await fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(enrollment);
});
