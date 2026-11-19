import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { EnrollmentsStore } from "$lib/client/stores/enrollments.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { notificationsStore } from "$lib/client/stores/notifications.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";

let mockParams: Record<string, string> = {};

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return mockParams;
        },
        get url() {
          return new URL("http://localhost/");
        },
      };
    },
  };
});

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import StudentsPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function buildContext() {
  const map = new Map<StoreKey, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  map.set(StoreKey.SUBJECTS, new SubjectsStore());
  map.set(StoreKey.PERIODS, new PeriodsStore());
  map.set(StoreKey.COMMISSIONS, new CommissionsStore());
  map.set(StoreKey.ENROLLMENTS, new EnrollmentsStore());
  return map;
}

const routes: Array<[string, unknown]> = [
  [
    "/faculties",
    [
      {
        id: 1,
        name: "Facultad de Ingeniería",
        slug: "facultad-de-ingenieria",
      },
    ],
  ],
  [
    "/subjects",
    [
      {
        id: 5,
        faculty_id: 1,
        name: "Álgebra Lineal",
        slug: "algebra-lineal",
        faculty_name: "Facultad de Ingeniería",
        faculty_slug: "facultad-de-ingenieria",
      },
    ],
  ],
  [
    "/periods",
    [
      {
        id: 2,
        year: 2025,
        semester: 1,
        subject_id: 5,
        subject_period_id: 1,
        subject_name: "Álgebra Lineal",
        subject_slug: "algebra-lineal",
      },
    ],
  ],
  [
    "/commissions",
    [
      {
        id: 1,
        period_id: 2,
        subject_id: 5,
        name: "Comisión Mañana",
        slug: "comision-manana",
        student_count: 1,
      },
    ],
  ],
  [
    "/enrollments",
    [
      {
        id: 1,
        person_id: 1,
        subject_period_id: 1,
        commission_id: 1,
        name: "Juan Pérez",
        legajo: "ING-001",
      },
    ],
  ],
];

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
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2025",
    semester: "1",
    commission: "comision-manana",
  };
  apiFetchMock.mockImplementation((path: string) => {
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });
});

afterEach(() => {
  vi.useRealTimers();
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("renders the enrollment roster of a commission with the person legajo", async () => {
  component = mount(StudentsPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.body.textContent).toContain("Inscripciones");
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.body.textContent).toContain("ING-001");
  expect(apiFetchMock).toHaveBeenCalledWith("/enrollments?commission_id=1");
});

test("removing a student hides the row, and undo restores it without a request", async () => {
  component = mount(StudentsPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  const row = () => document.body.querySelector('[data-test-id="student-name-1"]');
  expect(row()).not.toBeNull();

  vi.useFakeTimers();

  (document.body.querySelector('[data-test-id="delete-btn-1"]') as HTMLButtonElement).click();
  flushSync();
  (document.body.querySelector(
    '[data-test-id="confirm-dialog-confirm-btn"]',
  ) as HTMLButtonElement).click();
  flushSync();

  expect(row()).toBeNull();
  expect(apiFetchMock).not.toHaveBeenCalledWith("/enrollments/1", { method: "DELETE" });

  notificationsStore.items[0]?.action?.onAction();
  flushSync();
  expect(row()).not.toBeNull();

  await vi.advanceTimersByTimeAsync(6000);
  expect(apiFetchMock).not.toHaveBeenCalledWith("/enrollments/1", { method: "DELETE" });
});
