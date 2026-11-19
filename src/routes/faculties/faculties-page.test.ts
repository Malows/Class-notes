import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { notificationsStore } from "$lib/client/stores/notifications.svelte";

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return {};
        },
        get url() {
          return new URL("http://localhost/faculties");
        },
      };
    },
  };
});

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import FacultiesPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const faculties = [
  { id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" },
  { id: 2, name: "Facultad de Ciencias", slug: "facultad-de-ciencias" },
];

function buildContext() {
  const map = new Map<StoreKey, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  return map;
}

async function mountPage() {
  component = mount(FacultiesPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();
}

function rowExists(id: number) {
  return document.body.querySelector(`[data-test-id="faculty-name-${id}"]`) !== null;
}

async function confirmDelete(id: number) {
  const deleteBtn = document.body.querySelector(
    `[data-test-id="delete-btn-${id}"]`,
  ) as HTMLButtonElement;
  deleteBtn.click();
  flushSync();

  const confirmBtn = document.body.querySelector(
    '[data-test-id="confirm-dialog-confirm-btn"]',
  ) as HTMLButtonElement;
  confirmBtn.click();
  flushSync();
}

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
  notificationsStore.items = [];
  apiFetchMock.mockResolvedValue(faculties);
});

afterEach(() => {
  vi.useRealTimers();
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("removes the faculty immediately and commit waits for the undo window", async () => {
  await mountPage();
  expect(rowExists(2)).toBe(true);

  vi.useFakeTimers();
  await confirmDelete(2);

  expect(rowExists(2)).toBe(false);
  expect(apiFetchMock).not.toHaveBeenCalledWith("/faculties/2", { method: "DELETE" });
  expect(notificationsStore.items[0]?.action?.label).toBe("Deshacer");

  await vi.advanceTimersByTimeAsync(6000);

  expect(apiFetchMock).toHaveBeenCalledWith("/faculties/2", { method: "DELETE" });
  expect(rowExists(2)).toBe(false);
});

test("undo restores the faculty in place and never deletes", async () => {
  await mountPage();

  vi.useFakeTimers();
  await confirmDelete(2);

  expect(rowExists(2)).toBe(false);
  notificationsStore.items[0]?.action?.onAction();
  flushSync();

  expect(rowExists(2)).toBe(true);
  await vi.advanceTimersByTimeAsync(6000);

  expect(apiFetchMock).not.toHaveBeenCalledWith("/faculties/2", { method: "DELETE" });
});

test("a failed commit restores the faculty and reports it", async () => {
  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (path === "/faculties/2" && init?.method === "DELETE") {
      return Promise.reject(new Error("no se pudo borrar"));
    }
    return Promise.resolve(faculties);
  });

  await mountPage();
  expect(rowExists(2)).toBe(true);

  vi.useFakeTimers();
  await confirmDelete(2);
  expect(rowExists(2)).toBe(false);

  await vi.advanceTimersByTimeAsync(6000);

  expect(rowExists(2)).toBe(true);
  const error = notificationsStore.items.find((toast) => toast.type === "error");
  expect(error?.message).toContain("Facultad de Ciencias");
  expect(error?.message).toContain("no se pudo borrar");
  expect(error?.action?.label).toBe("Reintentar");

  // Retry hides the row again and schedules a new commit.
  error?.action?.onAction();
  flushSync();
  expect(rowExists(2)).toBe(false);

  await vi.advanceTimersByTimeAsync(6000);
  const deletes = apiFetchMock.mock.calls.filter(
    ([path, init]) => path === "/faculties/2" && (init as { method?: string })?.method === "DELETE",
  );
  expect(deletes).toHaveLength(2);
});
