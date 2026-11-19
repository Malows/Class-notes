import { loadTranslations } from "$lib/common/i18n/config";
import { StoreKey } from "$lib/common";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, expect, test, vi } from "vitest";

import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";

let mockParams = $state<Record<string, string>>({});
let mockUrl = $state<URL>(new URL("http://localhost/"));

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return mockParams;
        },
        get url() {
          return mockUrl;
        },
      };
    },
  };
});

import Breadcrumbs from "./Breadcrumbs.svelte";

const faculties = [{ id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" }];
const subjects = [
  {
    id: 1,
    faculty_id: 1,
    name: "Álgebra Lineal",
    faculty_name: "Facultad de Ingeniería",
    faculty_slug: "facultad-de-ingenieria",
    slug: "algebra-lineal",
  },
];
const periods = [{ id: 3, subject_id: 1, subject_slug: "algebra-lineal", year: 2025, semester: 1 }];
const commissions = [
  {
    id: 4,
    subject_id: 1,
    period_id: 3,
    name: "Comisión Mañana",
    slug: "comision-manana",
    student_count: 0,
  },
];

let component: ReturnType<typeof mount>;

function mountWithContext() {
  const facultiesStore = new FacultiesStore();
  facultiesStore.items = faculties;
  const subjectsStore = new SubjectsStore();
  subjectsStore.items = subjects;
  const periodsStore = new PeriodsStore();
  periodsStore.items = periods;
  const commissionsStore = new CommissionsStore();
  commissionsStore.items = commissions;

  const context = new Map<StoreKey, unknown>([
    [StoreKey.FACULTIES, facultiesStore],
    [StoreKey.SUBJECTS, subjectsStore],
    [StoreKey.PERIODS, periodsStore],
    [StoreKey.COMMISSIONS, commissionsStore],
  ]);

  component = mount(Breadcrumbs, { target: document.body, context });
  flushSync();
}

function useCommissionAttendance() {
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2025",
    semester: "1",
    commission: "comision-manana",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/attendance",
  );
}

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  mockParams = {};
  mockUrl = new URL("http://localhost/");
});

test("names faculty, subject, period, commission and view", async () => {
  await loadTranslations("es", "/");
  useCommissionAttendance();

  mountWithContext();

  expect(document.body.querySelector('[data-test-id="breadcrumb-link-0"]')?.textContent).toBe(
    "Facultad de Ingeniería",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-link-1"]')?.textContent).toBe(
    "Álgebra Lineal",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-link-2"]')?.textContent).toBe(
    "2025 · 1º",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-link-3"]')?.textContent).toBe(
    "Comisión Mañana",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-text-4"]')?.textContent).toBe(
    "Asistencia",
  );
});

test("marks only the current page and keeps the rest as links", async () => {
  await loadTranslations("es", "/");
  useCommissionAttendance();

  mountWithContext();

  const current = document.body.querySelectorAll('[aria-current="page"]');
  expect(current).toHaveLength(1);
  expect(current[0]?.getAttribute("data-test-id")).toBe("breadcrumb-text-4");

  for (const index of [0, 1, 2, 3]) {
    expect(
      document.body
        .querySelector(`[data-test-id="breadcrumb-link-${index}"]`)
        ?.hasAttribute("aria-current"),
    ).toBe(false);
  }
});

test("collapses the middle on a phone and keeps the last two crumbs", async () => {
  await loadTranslations("es", "/");
  useCommissionAttendance();

  mountWithContext();

  const steps = document.body.querySelectorAll(".step");
  const collapsed = document.body.querySelectorAll(".step.is-collapsed");
  expect(steps).toHaveLength(5);
  expect(collapsed).toHaveLength(3);

  const gap = document.body.querySelector(".gap-mark");
  expect(gap?.textContent).toBe("…");
  expect(gap?.getAttribute("aria-hidden")).toBe("true");
});

test("falls back to generic labels while the stores are still empty", async () => {
  await loadTranslations("es", "/");
  useCommissionAttendance();

  // No context: the first paint gets a readable trail, not blank crumbs.
  component = mount(Breadcrumbs, { target: document.body });
  flushSync();

  expect(document.body.querySelector('[data-test-id="breadcrumb-link-0"]')?.textContent).toBe(
    "Facultad",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-link-1"]')?.textContent).toBe(
    "Materia",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-link-2"]')?.textContent).toBe(
    "2025 · 1º",
  );
  expect(document.body.querySelector('[data-test-id="breadcrumb-link-3"]')?.textContent).toBe(
    "Comisión",
  );
});
