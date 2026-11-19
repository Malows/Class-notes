import { loadTranslations } from "$lib/common/i18n/config";
import { metadataStore } from "$lib/client/stores/metadata.svelte";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi, beforeEach } from "vitest";

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
  {
    id: 2,
    faculty_id: 1,
    name: "Análisis Matemático I",
    faculty_name: "Facultad de Ingeniería",
    faculty_slug: "facultad-de-ingenieria",
    slug: "analisis-matematico-i",
  },
  {
    id: 3,
    faculty_id: 1,
    name: "Física General I",
    faculty_name: "Facultad de Ingeniería",
    faculty_slug: "facultad-de-ingenieria",
    slug: "fisica-general-i",
  },
];
const periods = [
  { id: 3, subject_id: 2, subject_slug: "analisis-matematico-i", year: 2026, semester: 1 },
];
const commissions = [
  { id: 4, subject_id: 2, period_id: 3, name: "Comisión A", slug: "comision-a", student_count: 0 },
];

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function buildContext() {
  const map = new Map<StoreKey, unknown>();
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

test("Sidebar renders the editorial brand and static navigation", async () => {
  await loadTranslations("en", "/");
  mountWithContext();
  flushSync();

  const aside = document.body.querySelector("aside");
  expect(aside).toBeTruthy();
  expect(document.body.querySelector('[data-test-id="sidebar-brand"]')).toBeTruthy();
  expect(document.body.querySelector('[data-test-id="sidebar-item-in-class"]')).toBeTruthy();
  expect(
    document.body.querySelector('[data-test-id="sidebar-item-in-class"]')?.getAttribute("href"),
  ).toBe("/");
});

test("Sidebar loads context stores and renders real sibling items as links", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "analisis-matematico-i",
    year: "2026",
    semester: "1",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/analisis-matematico-i/periods/2026/1",
  );

  mountWithContext();
  flushSync();
  await flush();
  flushSync();

  const headers = Array.from(
    document.body.querySelectorAll('[data-test-id="sidebar-context-heading"]'),
  ).map((h) => h.textContent?.trim());
  expect(headers).toContain("Subjects (Facultad de Ingeniería)");
  expect(headers).toContain("Periods");
  expect(headers).toContain("Commissions");

  // Subjects of the faculty shown with direct links
  const subjectLink = document.body.querySelector(
    'a[href="/faculties/facultad-de-ingenieria/subjects/analisis-matematico-i/periods"]',
  ) as HTMLAnchorElement;
  expect(subjectLink).not.toBeNull();
  expect(subjectLink.textContent).toContain("Análisis Matemático I");

  // Period of the subject with a direct link
  const periodLink = sectionLinks("Periods").find(
    (link) =>
      link.getAttribute("href") ===
      "/faculties/facultad-de-ingenieria/subjects/analisis-matematico-i/periods/2026/1/commissions",
  );
  expect(periodLink).not.toBeUndefined();
  expect(periodLink?.textContent).toContain("2026 · Term 1");

  // Commission with a direct link
  const commissionLink = document.body.querySelector(
    'a[href="/faculties/facultad-de-ingenieria/subjects/analisis-matematico-i/periods/2026/1/commissions/comision-a/overview"]',
  ) as HTMLAnchorElement;
  expect(commissionLink).not.toBeNull();
  expect(commissionLink.textContent).toContain("Comisión A");

  expect(apiFetchMock).toHaveBeenCalledWith("/faculties");
  expect(apiFetchMock).toHaveBeenCalledWith("/subjects");
  expect(apiFetchMock).toHaveBeenCalledWith("/periods?subject_id=2");
  expect(apiFetchMock).toHaveBeenCalledWith("/commissions");
});

test("Sidebar links the current term to the global period view", async () => {
  await loadTranslations("en", "/");
  metadataStore.initializeStore({
    periodData: { year: 2026, term: "Cuatrimestre I" },
    subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
  });

  mountWithContext();
  flushSync();

  expect(document.body.textContent).toContain("2026 · Term 1");
  const shortcut = document.body.querySelector(
    '[data-test-id="sidebar-current-term-link"]',
  ) as HTMLAnchorElement;
  expect(shortcut).not.toBeNull();
  expect(shortcut.getAttribute("href")).toBe("/periods/2026/1/subjects");
  expect(shortcut.getAttribute("aria-current")).toBeNull();
  expect(shortcut.getAttribute("aria-label")).toBe("Go to current term · 2026 · Term 1");
  expect(shortcut.textContent).toContain("2026 · Term 1");
  // The shortcut uses a typographic arrow, not a missing icon ligature.
  expect(shortcut.textContent).toContain("→");
  expect(shortcut.textContent).not.toContain("arrow_forward");
  // The metadata subject entry is not a destination of the shortcut any more.
  expect(
    document.body.querySelector('a[href="/faculties/1/subjects/1/periods"]'),
  ).toBeNull();
});

test("Sidebar reacts to metadata initialized after mount", async () => {
  await loadTranslations("en", "/");

  mountWithContext();
  flushSync();

  expect(document.body.textContent).not.toContain("Go to current term");
  expect(document.body.querySelector('[data-test-id="sidebar-current-term-link"]')).toBeNull();

  metadataStore.initializeStore({
    periodData: { year: 2026, term: "Cuatrimestre II" },
    subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
  });
  flushSync();

  expect(document.body.textContent).toContain("2026 · Term 2");
  expect(
    document.body.querySelector('[data-test-id="sidebar-current-term-link"]')?.getAttribute(
      "href",
    ),
  ).toBe("/periods/2026/2/subjects");
});

function sectionLinks(headingText: string): HTMLAnchorElement[] {
  const heading = Array.from(
    document.body.querySelectorAll('[data-test-id="sidebar-context-heading"]'),
  ).find((item) => item.textContent?.trim() === headingText);
  const section = heading?.parentElement;
  return Array.from(section?.querySelectorAll("a") ?? []) as HTMLAnchorElement[];
}

test("Sidebar mirrors the viewed cursada and keeps the current-term shortcut separate", async () => {
  await loadTranslations("en", "/");
  metadataStore.initializeStore({
    periodData: { year: 2026, term: "Cuatrimestre II" },
    subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
  });

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "analisis-matematico-i",
    year: "2026",
    semester: "1",
    commission: "comision-a",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/analisis-matematico-i/periods/2026/1/commissions/comision-a/attendance",
  );

  mountWithContext();
  flushSync();
  await flush();
  flushSync();

  const location = sectionLinks("You are viewing");
  expect(location.map((link) => link.textContent?.trim())).toEqual([
    "Facultad de Ingeniería",
    "Análisis Matemático I",
    "2026 · Term 1",
    "Comisión A",
  ]);

  const commissionLink = location.at(-1);
  expect(commissionLink?.getAttribute("href")).toBe(
    "/faculties/facultad-de-ingenieria/subjects/analisis-matematico-i/periods/2026/1/commissions/comision-a/overview",
  );
  expect(commissionLink?.getAttribute("aria-current")).toBe("true");

  // The active-term shortcut is its own labelled block with a divider, and it
  // never becomes part of the "You are viewing" trail.
  const shortcut = document.body.querySelector('[data-test-id="sidebar-current-term"]');
  expect(shortcut?.className).toContain("border-t");
  expect(shortcut?.querySelector('[data-test-id="sidebar-current-term-link"]')?.getAttribute("aria-label")).toBe("Go to current term · 2026 · Term 2");
  expect(shortcut?.textContent).toContain("2026 · Term 2");
  const shortcutLink = shortcut?.querySelector(
    '[data-test-id="sidebar-current-term-link"]',
  ) as HTMLAnchorElement;
  expect(shortcutLink.getAttribute("href")).toBe("/periods/2026/2/subjects");
  expect(shortcutLink.hasAttribute("aria-current")).toBe(false);
  expect(location.some((link) => link.textContent?.trim() === "Algoritmos")).toBe(false);
});
