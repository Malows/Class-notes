import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

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
  mockParams = { id: "1" };
  apiFetchMock.mockResolvedValue(detail);
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("renders the person and their cursadas with the commission link", async () => {
  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons/1");
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.body.textContent).toContain("ING-001");
  expect(document.body.textContent).toContain("Álgebra Lineal");

  const link = document.body.querySelector(
    '[data-test-id="person-cursada-link-10"]',
  ) as HTMLAnchorElement;
  expect(link).not.toBeNull();
  expect(link.getAttribute("href")).toBe(
    "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/overview",
  );
});

test("shows a cursada without commission as such", async () => {
  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

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

  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

  const notFound = document.body.querySelector('[data-test-id="person-detail-not-found"]');
  expect(notFound).not.toBeNull();
  expect(document.body.textContent).toContain("no existe");
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

  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

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

test("deletes the person after confirming and returns to the registry", async () => {
  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (init?.method === "DELETE") {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(detail);
  });

  component = mount(PersonDetailPage, { target: document.body });
  flushSync();
  await flush();
  flushSync();

  const deleteButton = document.body.querySelector(
    '[data-test-id="delete-person-btn"]',
  ) as HTMLElement;
  expect(deleteButton).not.toBeNull();
  deleteButton.click();
  flushSync();

  const message = document.body.textContent ?? "";
  expect(message).toContain("todas sus cursadas");

  const confirm = document.body.querySelector(
    '[data-test-id="confirm-dialog-confirm-btn"]',
  ) as HTMLElement;
  confirm.click();
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/persons/1", { method: "DELETE" });
  expect(gotoMock).toHaveBeenCalledWith("/persons");
});
