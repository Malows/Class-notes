import "@testing-library/jest-dom/vitest";
import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import EnrollmentModal from "./EnrollmentModal.svelte";

let component: ReturnType<typeof mount>;

const buttonByText = (text: string) =>
  [...document.body.querySelectorAll("button")].find((button) =>
    button.textContent?.includes(text),
  ) as HTMLButtonElement | undefined;

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

test("places a name error next to the search field and links it", () => {
  component = mount(EnrollmentModal, {
    target: document.body,
    props: {
      isOpen: true,
      searchPersons: vi.fn().mockResolvedValue([]),
      onCreate: vi.fn(),
      onClose: vi.fn(),
    },
  });
  flushSync();

  buttonByText("Crear")?.click();
  flushSync();

  const input = document.body.querySelector(
    '[data-test-id="enrollment-search-input"]',
  ) as HTMLInputElement;
  const error = document.body.querySelector('[data-test-id="enrollment-error"]');

  expect(error).not.toBeNull();
  expect(error).toHaveAttribute("role", "alert");
  expect(input.getAttribute("aria-describedby")).toBe("error-enrollment");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(error?.closest(".form-group")?.contains(input)).toBe(true);
});

test("places the bulk error next to the textarea", () => {
  component = mount(EnrollmentModal, {
    target: document.body,
    props: {
      isOpen: true,
      searchPersons: vi.fn().mockResolvedValue([]),
      onCreate: vi.fn(),
      onClose: vi.fn(),
    },
  });
  flushSync();

  buttonByText("Carga de alumnos")?.click();
  flushSync();
  buttonByText("Crear")?.click();
  flushSync();

  const textarea = document.body.querySelector(
    '[data-test-id="student-bulk-textarea"]',
  ) as HTMLTextAreaElement;
  const error = document.body.querySelector('[data-test-id="enrollment-error"]');

  expect(error?.textContent).toContain("Al menos un nombre");
  expect(textarea.getAttribute("aria-describedby")).toBe("error-enrollment");
  expect(error?.closest(".form-group")?.contains(textarea)).toBe(true);
});

test("reports a failed student search instead of an empty result", async () => {
  component = mount(EnrollmentModal, {
    target: document.body,
    props: {
      isOpen: true,
      searchPersons: vi.fn().mockRejectedValue(new Error("offline")),
      onCreate: vi.fn(),
      onClose: vi.fn(),
    },
  });
  flushSync();

  const input = document.body.querySelector(
    '[data-test-id="enrollment-search-input"]',
  ) as HTMLInputElement;
  input.value = "Ana";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  await new Promise((resolve) => setTimeout(resolve, 0));
  flushSync();

  const error = document.body.querySelector('[data-test-id="enrollment-error"]');
  expect(error?.textContent).toContain("No se pudo completar la búsqueda");
});
