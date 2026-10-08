import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
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
import CommissionOverviewPage from "./[commission]/overview/+page.svelte";

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
const periods = [{ id: 5, subject_id: 1, subject_slug: "algebra-lineal", year: 2026, semester: 2 }];
const commissions = [
  {
    id: 4,
    subject_id: 1,
    period_id: 5,
    name: "Comisión Mañana",
    slug: "comision-manana",
    student_count: 0,
  },
];

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function buildContext() {
  const map = new Map<StoreKey, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  map.set(StoreKey.SUBJECTS, new SubjectsStore());
  map.set(StoreKey.PERIODS, new PeriodsStore());
  map.set(StoreKey.COMMISSIONS, new CommissionsStore());
  return map;
}

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

beforeEach(async () => {
  await loadTranslations("es", "/");
  apiFetchMock.mockImplementation((path: string) => {
    if (path.startsWith("/faculties")) return Promise.resolve(faculties);
    if (path.startsWith("/subjects")) return Promise.resolve(subjects);
    if (path.startsWith("/periods")) return Promise.resolve(periods);
    if (path.startsWith("/commissions")) return Promise.resolve(commissions);
    if (path.startsWith("/overview")) return Promise.resolve(null);
    return Promise.resolve([]);
  });
});

test("commissions list shows not-found for an unknown nested period", async () => {
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2099",
    semester: "1",
  };

  component = mount(CommissionsPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.body.textContent).toContain("El periodo seleccionado no existe");
});

test("commission overview shows not-found for an unknown commission slug", async () => {
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "2",
    commission: "comision-inexistente",
  };

  component = mount(CommissionOverviewPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.body.textContent).toContain("La comisión seleccionada no existe");
});