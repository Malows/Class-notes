import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import PersonsPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

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
  apiFetchMock.mockResolvedValue(registry);
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("lists the registry and keeps persons without cursadas visible", async () => {
  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons?q=&limit=50&offset=0");
  expect(document.body.textContent).toContain("Ana Martinez");
  expect(document.body.textContent).toContain("Beto Gomez");

  const orphan = document.body.querySelector('[data-test-id="person-no-cursadas-2"]');
  expect(orphan).not.toBeNull();
  expect(orphan?.textContent).toContain("Sin cursadas");

  const count = document.body.querySelector('[data-test-id="person-cursadas-2"]');
  expect(count?.textContent?.trim()).toBe("0");
});

test("filters the registry when the user types", async () => {
  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

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

  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

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

  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

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

  component = mount(PersonsPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

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
