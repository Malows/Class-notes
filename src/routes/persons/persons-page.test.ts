import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";
import { notificationsStore } from "$lib/client/stores/notifications.svelte";

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import PersonsPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

let phoneViewport = false;
const viewportListeners = new Set<() => void>();

const registry = {
  items: [
    {
      id: 1,
      name: "Ana Martinez",
      legajo: "ING-004",
      enrollment_count: 2,
      last_subject_name: "Algebra Lineal",
      last_period_year: 2025,
      last_period_semester: 1,
    },
    {
      id: 2,
      name: "Beto Gomez",
      legajo: null,
      enrollment_count: 0,
      last_subject_name: null,
      last_period_year: null,
      last_period_semester: null,
    },
  ],
  total: 2,
  limit: 50,
  offset: 0,
};

const deleteCalls = () =>
  apiFetchMock.mock.calls.filter(([, init]) => (init as { method?: string })?.method === "DELETE");

function installMatchMedia() {
  vi.stubGlobal("matchMedia", (media: string) => ({
    get matches() {
      return phoneViewport;
    },
    media,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => viewportListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) =>
      viewportListeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function setViewport(isPhone: boolean) {
  phoneViewport = isPhone;
  for (const listener of viewportListeners) listener();
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
  phoneViewport = false;
  viewportListeners.clear();
  installMatchMedia();
  notificationsStore.items = [];
  await loadTranslations("es", "/");
  apiFetchMock.mockResolvedValue(registry);
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.clearAllMocks();
});

async function mountPage() {
  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();
}

test("lists the registry and keeps persons without cursadas visible", async () => {
  await mountPage();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons?q=&limit=50&offset=0");
  expect(document.body.textContent).toContain("Ana Martinez");
  expect(document.body.textContent).toContain("Beto Gomez");
  expect(document.body.textContent).toContain("Algebra Lineal · 2025 · 1º");

  const orphan = document.body.querySelector('[data-test-id="person-no-cursadas-2"]');
  expect(orphan).not.toBeNull();
  expect(orphan?.textContent).toContain("Sin cursadas");

  const count = document.body.querySelector('[data-test-id="person-cursadas-2"]');
  expect(count?.textContent?.trim()).toBe("0");
});

test("filters the registry when the user types", async () => {
  await mountPage();

  const input = document.body.querySelector(
    '[data-test-id="persons-search-input"]',
  ) as HTMLInputElement;
  expect(input).not.toBeNull();

  input.value = "beto";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons?q=beto&limit=50&offset=0");
});

test("shows an empty state when nothing matches", async () => {
  apiFetchMock.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

  await mountPage();

  const empty = document.body.querySelector('[data-test-id="persons-empty"]');
  expect(empty).not.toBeNull();
  expect(document.body.textContent).toContain("Ningún alumno coincide");
});

test("loads the next page and appends it", async () => {
  const first = {
    items: [registry.items[0]],
    total: 2,
    limit: 50,
    offset: 0,
  };
  const second = {
    items: [registry.items[1]],
    total: 2,
    limit: 50,
    offset: 1,
  };
  apiFetchMock.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

  await mountPage();

  const loadMore = document.body.querySelector('[data-test-id="persons-load-more"]') as HTMLElement;
  expect(loadMore).not.toBeNull();
  loadMore.click();
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenLastCalledWith("/persons?q=&limit=50&offset=1");
  expect(document.body.textContent).toContain("Ana Martinez");
  expect(document.body.textContent).toContain("Beto Gomez");
});

test("creates a person from the add action and reloads the list", async () => {
  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (init?.method === "POST") {
      return Promise.resolve({ id: 9, name: "Recien Creado", legajo: null });
    }
    return Promise.resolve(registry);
  });

  await mountPage();

  const addButton = document.body.querySelector('[data-test-id="add-btn"]') as HTMLElement;
  expect(addButton).not.toBeNull();
  addButton.click();
  flushSync();

  const nameInput = document.body.querySelector(
    '[data-test-id="person-name-input"]',
  ) as HTMLInputElement;
  expect(nameInput).not.toBeNull();
  nameInput.value = "Recien Creado";
  nameInput.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();

  const submit = document.body.querySelector('[data-test-id="submit-btn"]') as HTMLElement;
  submit.click();
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons", {
    method: "POST",
    body: JSON.stringify({ name: "Recien Creado", legajo: null }),
  });
  expect(apiFetchMock).toHaveBeenCalledWith("/persons?q=&limit=50&offset=0");
});

test("requests twenty persons per page on a phone and resets on a new query", async () => {
  phoneViewport = true;
  apiFetchMock.mockResolvedValue({
    items: [registry.items[0]],
    total: 2,
    limit: 20,
    offset: 0,
  });

  await mountPage();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons?q=&limit=20&offset=0");

  const loadMore = document.body.querySelector('[data-test-id="persons-load-more"]') as HTMLElement;
  loadMore.click();
  flushSync();
  await flush();
  flushSync();
  expect(apiFetchMock).toHaveBeenLastCalledWith("/persons?q=&limit=20&offset=1");

  const input = document.body.querySelector(
    '[data-test-id="persons-search-input"]',
  ) as HTMLInputElement;
  input.value = "ana";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenLastCalledWith("/persons?q=ana&limit=20&offset=0");
});

test("re-reads the page size when the viewport crosses the phone breakpoint", async () => {
  await mountPage();
  expect(apiFetchMock).toHaveBeenCalledWith("/persons?q=&limit=50&offset=0");

  setViewport(true);
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenLastCalledWith("/persons?q=&limit=20&offset=0");
});

test("compacts the mobile card to two lines without dropping the legajo or actions", async () => {
  phoneViewport = true;
  await mountPage();

  const card = document.body.querySelector('[data-test-id="person-card-1"]');
  expect(card).not.toBeNull();
  expect(card?.getAttribute("data-density")).toBe("compact");
  expect(card?.querySelector("dl")).toBeNull();

  const link = card?.querySelector('[data-test-id="person-card-link-1"]') as HTMLAnchorElement;
  expect(link).not.toBeNull();
  const firstLine = link.parentElement as HTMLElement;
  expect(firstLine.textContent).toContain("Ana Martinez");
  expect(firstLine.textContent).toContain("ING-004");

  const secondLine = firstLine.nextElementSibling as HTMLElement;
  expect(secondLine.textContent).toContain("Algebra Lineal · 2025 · 1º");

  const deleteButton = card?.querySelector(
    '[data-test-id="person-card-delete-1"]',
  ) as HTMLElement;
  expect(deleteButton).not.toBeNull();
  expect(deleteButton.closest("details")).not.toBeNull();
});

test("keeps the desktop table columns including the row actions", async () => {
  await mountPage();

  const headers = [...document.body.querySelectorAll(".editorial-table thead th")].map((th) =>
    th.textContent?.trim(),
  );
  expect(headers).toEqual(["Nombre", "Legajo", "Cursadas", "Última cursada", "Acciones"]);

  const actions = document.body.querySelector(
    '[data-test-id="person-row-actions-1"]',
  ) as HTMLDetailsElement;
  expect(actions).not.toBeNull();
  expect(actions.open).toBe(false);

  const deleteButton = document.body.querySelector(
    '[data-test-id="person-delete-1"]',
  ) as HTMLElement;
  expect(deleteButton.closest("details")).toBe(actions);
});

test("removes a person after confirming and restores it on undo without a request", async () => {
  vi.useFakeTimers();

  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await vi.advanceTimersByTimeAsync(0);
  flushSync();

  const actions = document.body.querySelector(
    '[data-test-id="person-row-actions-1"]',
  ) as HTMLDetailsElement;
  actions.open = true;
  (document.body.querySelector('[data-test-id="person-delete-1"]') as HTMLElement).click();
  flushSync();

  expect(document.body.textContent).toContain("¿Borrar a Ana Martinez?");
  expect(document.body.querySelector('[data-test-id="person-name-1"]')).not.toBeNull();

  (
    document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement
  ).click();
  flushSync();

  expect(document.body.querySelector('[data-test-id="person-name-1"]')).toBeNull();
  expect(document.body.querySelector('[data-test-id="persons-showing"]')?.textContent).toContain(
    "Mostrando 1 de 1",
  );
  expect(notificationsStore.items[0]?.action?.label).toBe("Deshacer");
  expect(deleteCalls()).toHaveLength(0);

  notificationsStore.items[0].action?.onAction();
  flushSync();
  await vi.advanceTimersByTimeAsync(6000);
  flushSync();

  expect(deleteCalls()).toHaveLength(0);
  const restored = document.body.querySelector('[data-test-id="person-name-1"]');
  expect(restored).not.toBeNull();
  const firstRow = document.body.querySelector(".editorial-table tbody tr");
  expect(firstRow?.textContent).toContain("Ana Martinez");
  expect(document.body.querySelector('[data-test-id="persons-showing"]')?.textContent).toContain(
    "Mostrando 2 de 2",
  );
});

test("deletes the person only after the undo window", async () => {
  vi.useFakeTimers();

  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await vi.advanceTimersByTimeAsync(0);
  flushSync();

  const actions = document.body.querySelector(
    '[data-test-id="person-row-actions-1"]',
  ) as HTMLDetailsElement;
  actions.open = true;
  (document.body.querySelector('[data-test-id="person-delete-1"]') as HTMLElement).click();
  flushSync();
  (
    document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement
  ).click();
  flushSync();

  expect(deleteCalls()).toHaveLength(0);

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);

  expect(deleteCalls()).toHaveLength(1);
  expect(deleteCalls()[0][0]).toBe("/persons/1");
  expect(document.body.querySelector('[data-test-id="person-name-1"]')).toBeNull();
});

test("restores the row and offers a retry after a failed delayed delete", async () => {
  vi.useFakeTimers();
  let deleteAttempts = 0;
  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (init?.method === "DELETE") {
      deleteAttempts += 1;
      return deleteAttempts === 1
        ? Promise.reject(new Error("Fallo de red"))
        : Promise.resolve(undefined);
    }
    return Promise.resolve(registry);
  });

  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await vi.advanceTimersByTimeAsync(0);
  flushSync();

  const actions = document.body.querySelector(
    '[data-test-id="person-row-actions-1"]',
  ) as HTMLDetailsElement;
  actions.open = true;
  (document.body.querySelector('[data-test-id="person-delete-1"]') as HTMLElement).click();
  flushSync();
  (
    document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement
  ).click();
  flushSync();

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);
  flushSync();

  expect(document.body.querySelector('[data-test-id="person-name-1"]')).not.toBeNull();
  const error = document.body.querySelector('[data-test-id="person-delete-error"]');
  expect(error).not.toBeNull();
  expect(error?.textContent).toContain("No se pudo borrar al alumno");

  const retry = [...(error?.querySelectorAll("button") ?? [])].find((button) =>
    button.textContent?.includes("Reintentar"),
  );
  retry?.click();
  flushSync();

  // Retrying keeps the confirmation before scheduling again.
  expect(document.body.textContent).toContain("¿Borrar a Ana Martinez?");
  (
    document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement
  ).click();
  flushSync();

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);
  flushSync();

  expect(deleteCalls()).toHaveLength(2);
  expect(document.body.querySelector('[data-test-id="person-name-1"]')).toBeNull();
});
