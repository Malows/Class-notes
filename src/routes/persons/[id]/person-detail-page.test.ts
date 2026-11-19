import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";
import { notificationsStore } from "$lib/client/stores/notifications.svelte";

let mockParams: Record<string, string> = {};

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return mockParams;
        },
        get url() {
          return new URL("http://localhost/persons/1");
        },
      };
    },
  };
});

const { gotoMock } = vi.hoisted(() => ({ gotoMock: vi.fn() }));

vi.mock("$app/navigation", () => ({ goto: gotoMock }));

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import PersonDetailPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const detail = {
  person: { id: 1, name: "Juan Pérez", legajo: "ING-001" },
  enrollments: [
    {
      id: 10,
      subject_period_id: 1,
      commission_id: 1,
      subject_name: "Álgebra Lineal",
      subject_slug: "algebra-lineal",
      period_year: 2025,
      period_semester: 1,
      commission_name: "Comisión Mañana",
      commission_slug: "comision-manana",
      faculty_slug: "facultad-de-ingenieria",
      faculty_name: "Facultad de Ingeniería",
    },
    {
      id: 11,
      subject_period_id: 2,
      commission_id: null,
      subject_name: "Análisis Matemático I",
      subject_slug: "analisis-matematico-i",
      period_year: 2025,
      period_semester: 2,
      commission_name: null,
      commission_slug: null,
      faculty_slug: "facultad-de-ingenieria",
      faculty_name: "Facultad de Ingeniería",
    },
  ],
};

const deleteCalls = () =>
  apiFetchMock.mock.calls.filter(([, init]) => (init as { method?: string })?.method === "DELETE");

beforeEach(async () => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  Element.prototype.animate = vi.fn(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as never;
  notificationsStore.items = [];
  await loadTranslations("es", "/");
  mockParams = { id: "1" };
  apiFetchMock.mockResolvedValue(detail);
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.clearAllMocks();
});

async function mountPage() {
  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();
}

async function mountPageWithFakeTimers() {
  vi.useFakeTimers();
  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await vi.advanceTimersByTimeAsync(0);
  flushSync();
}

async function confirmDelete() {
  const actions = document.body.querySelector(
    '[data-test-id="person-actions"]',
  ) as HTMLDetailsElement;
  actions.open = true;
  (
    document.body.querySelector('[data-test-id="delete-person-btn"]') as HTMLElement
  ).click();
  flushSync();

  (
    document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement
  ).click();
  flushSync();
}

test("renders the person and their cursadas with the commission link", async () => {
  await mountPage();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons/1");
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.body.textContent).toContain("ING-001");
  expect(document.body.textContent).toContain("Álgebra Lineal");
  expect(document.body.textContent).toContain("2025 · 1º");
  expect(document.body.textContent).not.toContain("2025 - 1º");

  const link = document.body.querySelector(
    '[data-test-id="person-cursada-link-10"]',
  ) as HTMLAnchorElement;
  expect(link).not.toBeNull();
  expect(link.getAttribute("href")).toBe(
    "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/overview",
  );
});

test("shows a cursada without commission as such", async () => {
  await mountPage();

  const sinComision = document.body.querySelector(
    '[data-test-id="person-cursada-sin-comision-11"]',
  );
  expect(sinComision).not.toBeNull();
  expect(sinComision?.textContent).toContain("Sin comisión");
  expect(document.body.querySelector('[data-test-id="person-cursada-link-11"]')).toBeNull();
});

test("shows the not-found state for an unknown person", async () => {
  mockParams = { id: "999" };
  apiFetchMock.mockRejectedValue(new Error("Person not found"));

  await mountPage();

  const notFound = document.body.querySelector('[data-test-id="person-detail-not-found"]');
  expect(notFound).not.toBeNull();
  expect(notFound?.textContent).toContain("No encontramos a este alumno");
  expect(
    document.body.querySelector('[data-test-id="person-detail-not-found"]')?.textContent,
  ).not.toContain("no pudo cargarse");
});

test("distinguishes a load failure from a missing person and retries", async () => {
  apiFetchMock
    .mockRejectedValueOnce(new Error("Simulated server failure"))
    .mockResolvedValueOnce(detail);

  await mountPage();

  expect(document.body.textContent).toContain("No se pudo cargar el alumno");
  expect(document.body.querySelector('[data-test-id="person-detail-not-found"]')).toBeNull();

  const retry = [...document.body.querySelectorAll("button")].find((button) =>
    button.textContent?.includes("Reintentar"),
  );
  expect(retry).toBeDefined();
  retry?.click();
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledTimes(2);
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.body.textContent).not.toContain("No se pudo cargar el alumno");
});

test("edits the person from the registry detail", async () => {
  const updated = {
    ...detail,
    person: { ...detail.person, name: "Juan Pérez Editado" },
  };
  let getCalls = 0;
  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (init?.method === "PUT") {
      return Promise.resolve({ id: 1, name: "Juan Pérez Editado", legajo: "ING-001" });
    }
    getCalls += 1;
    return Promise.resolve(getCalls === 1 ? detail : updated);
  });

  await mountPage();

  const editButton = document.body.querySelector('[data-test-id="edit-person-btn"]') as HTMLElement;
  expect(editButton).not.toBeNull();
  editButton.click();
  flushSync();

  const nameInput = document.body.querySelector(
    '[data-test-id="person-name-input"]',
  ) as HTMLInputElement;
  expect(nameInput.value).toBe("Juan Pérez");
  nameInput.value = "Juan Pérez Editado";
  nameInput.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();

  const submit = document.body.querySelector('[data-test-id="submit-btn"]') as HTMLElement;
  submit.click();
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons/1", {
    method: "PUT",
    body: JSON.stringify({ name: "Juan Pérez Editado", legajo: "ING-001" }),
  });
  expect(document.body.textContent).toContain("Juan Pérez Editado");
});

test("confirms the deletion before removing the person from the view", async () => {
  await mountPage();

  const deleteButton = document.body.querySelector(
    '[data-test-id="delete-person-btn"]',
  ) as HTMLElement;
  expect(deleteButton).not.toBeNull();

  // Delete is behind the page's disclosure, not a filled page-level button.
  const actions = document.body.querySelector(
    '[data-test-id="person-actions"]',
  ) as HTMLDetailsElement;
  expect(actions).not.toBeNull();
  expect(actions.open).toBe(false);
  expect(deleteButton.closest("details")).toBe(actions);
  expect(deleteButton.className).not.toContain("btn-error");

  actions.open = true;
  deleteButton.click();
  flushSync();

  const message = document.body.textContent ?? "";
  expect(message).toContain("todas sus cursadas");
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(deleteCalls()).toHaveLength(0);
});

test("stays on the page during the undo window and leaves only after the commit", async () => {
  await mountPageWithFakeTimers();

  await confirmDelete();

  expect(deleteCalls()).toHaveLength(0);
  expect(gotoMock).not.toHaveBeenCalled();
  expect(document.body.querySelector('[data-test-id="person-detail-deleted"]')).not.toBeNull();
  expect(document.body.textContent).toContain("Alumno borrado");

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);

  expect(deleteCalls()).toHaveLength(1);
  expect(deleteCalls()[0][0]).toBe("/persons/1");
  expect(gotoMock).toHaveBeenCalledWith("/persons");
});

test("undo restores the detail without sending a delete request", async () => {
  await mountPageWithFakeTimers();

  await confirmDelete();
  expect(notificationsStore.items[0]?.action?.label).toBe("Deshacer");

  (
    document.body.querySelector('[data-test-id="person-delete-undo-btn"]') as HTMLElement
  ).click();
  flushSync();

  expect(document.body.querySelector('[data-test-id="person-detail-deleted"]')).toBeNull();
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.body.textContent).toContain("Álgebra Lineal");

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);

  expect(deleteCalls()).toHaveLength(0);
  expect(gotoMock).not.toHaveBeenCalled();
});

test("restores the detail after a failed commit and retries through the confirmation", async () => {
  let deleteAttempts = 0;
  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (init?.method === "DELETE") {
      deleteAttempts += 1;
      return deleteAttempts === 1
        ? Promise.reject(new Error("Fallo de red"))
        : Promise.resolve(undefined);
    }
    return Promise.resolve(detail);
  });

  await mountPageWithFakeTimers();
  await confirmDelete();

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);
  flushSync();

  expect(deleteCalls()).toHaveLength(1);
  expect(gotoMock).not.toHaveBeenCalled();
  expect(document.body.querySelector('[data-test-id="person-detail-deleted"]')).toBeNull();
  expect(document.body.textContent).toContain("Juan Pérez");

  const error = document.body.querySelector('[data-test-id="person-delete-error"]');
  expect(error).not.toBeNull();
  expect(error?.textContent).toContain("No se pudo borrar al alumno");

  const retry = [...(error?.querySelectorAll("button") ?? [])].find((button) =>
    button.textContent?.includes("Reintentar"),
  );
  expect(retry).toBeDefined();
  retry?.click();
  flushSync();

  // The retry keeps the destructive confirmation before removing the person.
  expect(document.body.textContent).toContain("¿Borrar a Juan Pérez?");
  (
    document.body.querySelector('[data-test-id="confirm-dialog-confirm-btn"]') as HTMLElement
  ).click();
  flushSync();

  await vi.advanceTimersByTimeAsync(6000);
  await vi.advanceTimersByTimeAsync(0);

  expect(deleteCalls()).toHaveLength(2);
  expect(gotoMock).toHaveBeenCalledWith("/persons");
});
