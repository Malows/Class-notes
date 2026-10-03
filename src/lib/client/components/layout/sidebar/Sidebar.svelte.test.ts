import { loadTranslations } from "$lib/common/i18n/config";
import { metadataStore } from "$lib/client/stores/metadata.svelte";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/svelte";

import { StoreKey } from "$lib/common";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { NavStore } from "$lib/client/stores/nav.svelte";
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

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return {
    apiFetch: apiFetchMock,
  };
});

import Sidebar from "./Sidebar.svelte";

const faculties = [{ id: 1, name: "Facultad de Ingeniería" }];
const subjects = [
  { id: 1, faculty_id: 1, name: "Álgebra Lineal" },
  { id: 2, faculty_id: 1, name: "Análisis Matemático I" },
  { id: 3, faculty_id: 1, name: "Física General I" },
];
const periods = [{ id: 3, subject_id: 2, year: 2026, semester: 1 }];
const commissions = [{ id: 4, period_id: 3, name: "Comisión A" }];

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function buildContext() {
  const map = new Map<symbol, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  map.set(StoreKey.SUBJECTS, new SubjectsStore());
  map.set(StoreKey.PERIODS, new PeriodsStore());
  map.set(StoreKey.COMMISSIONS, new CommissionsStore());
  map.set(StoreKey.NAV, new NavStore());
  return map;
}

function mountWithContext(sidebar = Sidebar) {
  component = mount(sidebar, { target: document.body, context: buildContext() });
  flushSync();
}

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

beforeEach(() => {
  mockParams = {};
  mockUrl = new URL("http://localhost/");
  metadataStore.initializeStore(null);
  apiFetchMock.mockImplementation((path: string) => {
    if (path.startsWith("/faculties")) return Promise.resolve(faculties);
    if (path.startsWith("/subjects")) return Promise.resolve(subjects);
    if (path.startsWith("/periods")) return Promise.resolve(periods);
    if (path.startsWith("/commissions")) return Promise.resolve(commissions);
    return Promise.resolve([]);
  });
});

test("Sidebar renders and handles mobile/collapse toggles", async () => {
  await loadTranslations("en", "/");
  mountWithContext();
  flushSync();

  const aside = document.body.querySelector("aside");
  expect(aside).toBeTruthy();
  expect(aside?.classList.contains("open")).toBe(false);
  expect(aside?.classList.contains("collapsed")).toBe(false);

  // Toggle mobile menu
  const toggleMobileBtn = document.body.querySelector(".sidebar-toggle") as HTMLButtonElement;
  expect(toggleMobileBtn).toBeTruthy();
  await fireEvent.click(toggleMobileBtn);
  flushSync();
  expect(aside?.classList.contains("open")).toBe(true);

  // Toggle collapse sidebar (via header trigger inside SidebarHeader)
  const collapseBtn = document.body.querySelector(".sidebar-header button") as HTMLButtonElement;
  expect(collapseBtn).toBeTruthy();
  await fireEvent.click(collapseBtn);
  flushSync();
  expect(aside?.classList.contains("collapsed")).toBe(true);
});

test("Sidebar loads context stores and renders real sibling items as links", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty_id: "1",
    subject_id: "2",
    period_id: "3",
  };
  mockUrl = new URL("http://localhost/faculties/1/subjects/2/periods/3");

  mountWithContext();
  flushSync();
  await flush();
  flushSync();

  const headers = Array.from(document.body.querySelectorAll("h6")).map((h) => h.textContent?.trim());
  expect(headers).toContain("Subjects (Facultad de Ingeniería)");
  expect(headers).toContain("Periods");
  expect(headers).toContain("Commissions");

  // Subjects of the faculty shown with direct links
  const subjectLink = document.body.querySelector(
    'a[href="/faculties/1/subjects/2/periods"]',
  ) as HTMLAnchorElement;
  expect(subjectLink).not.toBeNull();
  expect(subjectLink.textContent).toContain("Análisis Matemático I");

  // Period of the subject with a direct link
  const periodLink = document.body.querySelector(
    'a[href="/faculties/1/subjects/2/periods/3/commissions"]',
  ) as HTMLAnchorElement;
  expect(periodLink).not.toBeNull();
  expect(periodLink.textContent).toContain("2026 - 1º");

  // Commission with a direct link
  const commissionLink = document.body.querySelector(
    'a[href="/faculties/1/subjects/2/periods/3/commissions/4/overview"]',
  ) as HTMLAnchorElement;
  expect(commissionLink).not.toBeNull();
  expect(commissionLink.textContent).toContain("Comisión A");

  expect(apiFetchMock).toHaveBeenCalledWith("/faculties");
  expect(apiFetchMock).toHaveBeenCalledWith("/subjects");
  expect(apiFetchMock).toHaveBeenCalledWith("/periods?subject_id=2");
  expect(apiFetchMock).toHaveBeenCalledWith("/commissions");
});

test("Sidebar renders metadata context when available", async () => {
  await loadTranslations("en", "/");
  metadataStore.initializeStore({
    periodData: { year: 2026, term: "Cuatrimestre I" },
    subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
  });

  mountWithContext();
  flushSync();

  expect(document.body.textContent).toContain("Cuatrimestre Activo (2026 - Cuatrimestre I)");
  const subjectLink = document.body.querySelector(
    'a[href="/faculties/1/subjects/1/periods"]',
  ) as HTMLAnchorElement;
  expect(subjectLink).not.toBeNull();
  expect(subjectLink.textContent).toContain("Algoritmos");
});