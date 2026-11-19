import "@testing-library/jest-dom/vitest";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, expect, test } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import PeriodPicker from "./PeriodPicker.svelte";
import type { PeriodOption } from "./dashboard-model";

const options: PeriodOption[] = [
  {
    id: 5,
    key: "2026-2",
    year: 2026,
    semester: 2,
    commissionCount: 0,
    studentCount: 0,
    isActive: true,
    hasData: false,
  },
  {
    id: 4,
    key: "2026-1",
    year: 2026,
    semester: 1,
    commissionCount: 2,
    studentCount: 6,
    isActive: false,
    hasData: true,
  },
];

let component: ReturnType<typeof mount> | undefined;

function mountPicker(selectedKey = "2026-1") {
  component = mount(PeriodPicker, {
    target: document.body,
    props: { options, selectedKey, onSelect: () => {} },
  });
  flushSync();
}

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  document.body.innerHTML = "";
});

test("the fallback note sits directly under the selector and names the shown term", async () => {
  await loadTranslations("es", "/");
  mountPicker();

  const select = document.body.querySelector('[data-test-id="period-select"]');
  const note = document.body.querySelector('[data-test-id="period-active-note"]');
  const picker = document.body.querySelector('[data-test-id="period-picker"]');

  expect(select).not.toBeNull();
  expect(note).not.toBeNull();
  expect(picker).not.toBeNull();
  expect(picker).toContainElement(note as HTMLElement);
  // Same column as the select, sequenced after it: no journey down to the stats.
  expect(note?.parentElement).toBe(select?.parentElement);
  expect(
    (select as Element).compareDocumentPosition(note as Node) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(note?.textContent?.trim()).toBe(
    "El período en curso no tiene comisiones. Mostrando 2026 · 1º.",
  );
});

test("the fallback note uses the English copy and period label", async () => {
  await loadTranslations("en", "/");
  mountPicker();

  const note = document.body.querySelector('[data-test-id="period-active-note"]');
  expect(note?.textContent?.trim()).toBe(
    "The current term has no commissions. Showing 2026 · Term 1.",
  );
});

test("no fallback note when the selected term is the active one", async () => {
  await loadTranslations("es", "/");
  mountPicker("2026-2");

  expect(document.body.querySelector('[data-test-id="period-active-note"]')).toBeNull();
});
