import { loadTranslations } from "$lib/common/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import ConfirmDialog from "./ConfirmDialog.svelte";

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

const mountDialog = (props: Record<string, unknown> = {}) => {
  component = mount(ConfirmDialog, {
    target: document.body,
    props: {
      isOpen: true,
      title: "Confirmar borrado",
      message: "¿Seguro?",
      onConfirm: vi.fn(),
      onClose: vi.fn(),
      ...props,
    },
  });
  flushSync();
};

const confirmButton = () =>
  document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement;

const cancelButton = () =>
  document.body.querySelector('[data-test-id="confirm-dialog-cancel-btn"]') as HTMLElement;

test("uses the translated labels by default", () => {
  mountDialog();

  expect(confirmButton().textContent?.trim()).toBe("Confirmar");
  expect(cancelButton().textContent?.trim()).toBe("Cancelar");
});

test("lets the caller override both labels", () => {
  mountDialog({ confirmText: "Borrar todo", cancelText: "Mejor no" });

  expect(confirmButton().textContent?.trim()).toBe("Borrar todo");
  expect(cancelButton().textContent?.trim()).toBe("Mejor no");
});

test("wires confirm and cancel callbacks", () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  mountDialog({ onConfirm, onClose });

  confirmButton().click();
  expect(onConfirm).toHaveBeenCalledTimes(1);

  cancelButton().click();
  expect(onClose).toHaveBeenCalledTimes(1);
});
