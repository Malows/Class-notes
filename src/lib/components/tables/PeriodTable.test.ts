import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import PeriodTable from "./PeriodTable.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("PeriodTable renderiza datos", async () => {
  await loadTranslations("es", "/");
  const editSpy = vi.fn();
  const deleteSpy = vi.fn();
  component = mount(PeriodTable, {
    target: document.body,
    props: {
      periods: [{ id: 1, year: 2026, semester: 1, subject_id: 1 }],
      facultyId: 1,
      subjectId: 1,
      onEdit: editSpy,
      onDelete: deleteSpy,
    },
  });
  flushSync();
  expect(document.body.textContent).toContain("2026");
});
