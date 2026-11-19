import "@testing-library/jest-dom/vitest";
import { loadTranslations } from "$lib/common/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import HelpDialog from "./HelpDialog.svelte";

let component: ReturnType<typeof mount>;

beforeEach(async () => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  Element.prototype.animate = vi.fn(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as never;
  await loadTranslations("es", "/");
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

function mountHelp() {
  component = mount(HelpDialog, { target: document.body });
  flushSync();
}

const trigger = () =>
  document.body.querySelector('[data-test-id="help-trigger"]') as HTMLButtonElement;

const dialog = () => document.body.querySelector('[data-test-id="modal-container"]');

function openHelp() {
  trigger().click();
  flushSync();
}

test("opens from the shell trigger without leaving the page", () => {
  mountHelp();

  expect(trigger()).toHaveAttribute("aria-label", "Abrir la guía rápida");
  expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
  expect(dialog()).toBeNull();

  openHelp();

  expect(dialog()).toBeTruthy();
  expect(trigger()).toBeTruthy();
  expect(document.body.textContent).toContain("Guía rápida");
});

test("documents the tri-state, shortcuts, summary, AI levels, paste format and optional legajo", () => {
  mountHelp();
  openHelp();

  const text = dialog()?.textContent ?? "";

  expect(text).toContain("presente ✓, ausente ✗ y sin tomar –");
  for (const key of ["←", "→", "↑", "Ctrl+Z"]) {
    expect(text).toContain(key);
  }
  expect(text).toContain("→ Presente");
  expect(text).toContain("← Ausente");
  expect(text).toContain("3 / 4");
  expect(text).toContain("IA!!");
  expect(text).toContain("un nombre por línea");
  expect(text).toContain("legajo es opcional");
});

test("closes from the footer without losing the trigger", () => {
  mountHelp();
  openHelp();

  expect(trigger()).toHaveAttribute("aria-expanded", "true");

  (document.body.querySelector('[data-test-id="help-close-btn"]') as HTMLButtonElement).click();
  flushSync();

  // The fade transition keeps the element around for one frame in jsdom; the
  // dialog state is what closes and restores the page behind it.
  expect(trigger()).toHaveAttribute("aria-expanded", "false");
  expect(trigger()).toBeTruthy();
});

test("switches language with the rest of the interface", async () => {
  await loadTranslations("en", "/");
  mountHelp();
  openHelp();

  const text = dialog()?.textContent ?? "";
  expect(text).toContain("Quick guide");
  expect(text).toContain("→ Present");
  expect(text).toContain("← Absent");
  expect(text).toContain("Ctrl+Z");
});
