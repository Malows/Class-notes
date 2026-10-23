import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import PersonModal from "./PersonModal.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  await loadTranslations("es", "/");
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

const type = (testId: string, value: string) => {
  const input = document.body.querySelector(`[data-test-id="${testId}"]`) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
};

test("submits the typed name and legajo", async () => {
  const onSave = vi.fn();
  component = mount(PersonModal, {
    target: document.body,
    props: { isOpen: true, mode: "create", person: null, onSave, onClose: vi.fn() },
  });
  flushSync();

  type("person-name-input", "Ana Nueva");
  type("person-legajo-input", "LEG-100");

  const submit = document.body.querySelector('[data-test-id="submit-btn"]') as HTMLElement;
  submit.click();
  flushSync();
  await flush();

  expect(onSave).toHaveBeenCalledWith("Ana Nueva", "LEG-100");
});

test("prefills the person when editing", async () => {
  component = mount(PersonModal, {
    target: document.body,
    props: {
      isOpen: true,
      mode: "edit",
      person: { id: 7, name: "Beto Editado", legajo: "LEG-7" },
      onSave: vi.fn(),
      onClose: vi.fn(),
    },
  });
  flushSync();

  const name = document.body.querySelector('[data-test-id="person-name-input"]') as HTMLInputElement;
  const legajo = document.body.querySelector(
    '[data-test-id="person-legajo-input"]',
  ) as HTMLInputElement;

  expect(name.value).toBe("Beto Editado");
  expect(legajo.value).toBe("LEG-7");
});

test("rejects an empty name", async () => {
  const onSave = vi.fn();
  component = mount(PersonModal, {
    target: document.body,
    props: { isOpen: true, mode: "create", person: null, onSave, onClose: vi.fn() },
  });
  flushSync();

  const submit = document.body.querySelector('[data-test-id="submit-btn"]') as HTMLElement;
  submit.click();
  flushSync();
  await flush();

  expect(onSave).not.toHaveBeenCalled();
  expect(document.body.querySelector('[data-test-id="person-validation-error"]')).not.toBeNull();
});

test("renders the server error and stays open when the legajo is rejected", async () => {
  const onSave = vi.fn().mockRejectedValue(new Error("Legajo already registered: LEG-100"));
  const onClose = vi.fn();
  component = mount(PersonModal, {
    target: document.body,
    props: { isOpen: true, mode: "create", person: null, onSave, onClose },
  });
  flushSync();

  type("person-name-input", "Ana Nueva");
  type("person-legajo-input", "LEG-100");

  const submit = document.body.querySelector('[data-test-id="submit-btn"]') as HTMLElement;
  submit.click();
  flushSync();
  await flush();

  const error = document.body.querySelector('[data-test-id="person-server-error"]');
  expect(error).not.toBeNull();
  expect(error?.textContent).toContain("Legajo already registered");
  expect(onClose).not.toHaveBeenCalled();
});
