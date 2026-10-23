import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { EnrollmentsStore } from "$lib/client/stores/enrollments.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
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

import CommissionsPage from "./+page.svelte";

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
    [{ id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" }],
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
        id: 9,
        person_id: 9,
        subject_period_id: 1,
        commission_id: null,
        name: "Alumno Sin Comisión",
        legajo: "SIN-009",
      },
    ],
  ],
];

beforeEach(async () => {
  await loadTranslations("es", "/");
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2025",
    semester: "1",
  };
  apiFetchMock.mockImplementation((path: string) => {
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("lists enrollments without commission in a pending section", async () => {
  component = mount(CommissionsPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  const pending = document.body.querySelector('[data-test-id="pending-enrollments"]');
  expect(pending).not.toBeNull();
  expect(pending?.textContent).toContain("Alumno Sin Comisión");
  expect(pending?.textContent).toContain("SIN-009");

  expect(apiFetchMock).toHaveBeenCalledWith(
    "/enrollments?subject_period_id=1&pending=true",
  );
});
