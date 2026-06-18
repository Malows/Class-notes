import { expect, test, vi, beforeEach } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import { navStore } from "./nav.svelte";
import { facultiesStore } from "./faculties.svelte";
import { subjectsStore } from "./subjects.svelte";
import { periodsStore } from "./periods.svelte";
import { commissionsStore } from "./commissions.svelte";

// Declare reactive states using Svelte 5 runes
let mockParams = $state<Record<string, string>>({});
let mockUrl = $state<URL>(new URL("http://localhost/"));

// Mock SvelteKit $app/state page reactively
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

beforeEach(() => {
  vi.restoreAllMocks();
  // Reset reactive mock states
  mockParams = {};
  mockUrl = new URL("http://localhost/");

  // Pre-set stores to loaded to avoid relative fetch crashes
  facultiesStore.items = [];
  facultiesStore.loaded = true;
  subjectsStore.items = [];
  subjectsStore.loaded = true;
  periodsStore.items = [{ id: 99, subject_id: 99, year: 2026, semester: 1 }];
  commissionsStore.items = [];
  commissionsStore.loaded = true;
});

test("navStore.breadcrumbs renders root Home breadcrumb by default", async () => {
  await loadTranslations("en", "/");

  expect(navStore.breadcrumbs).toHaveLength(1);
  expect(navStore.breadcrumbs[0]?.key).toBe("layout.home");
  expect(navStore.breadcrumbs[0]?.href).toBe("/");
});

test("navStore.breadcrumbs dynamically builds faculties, subjects, periods, and commissions breadcrumbs", async () => {
  await loadTranslations("en", "/");

  // Pre-populate Stores with mock data
  facultiesStore.items = [{ id: 1, name: "Facultad A" }];
  subjectsStore.items = [{ id: 2, faculty_id: 1, name: "Materia A" }];
  periodsStore.items = [{ id: 3, subject_id: 2, year: 2026, semester: 1 }];
  commissionsStore.items = [{ id: 4, period_id: 3, name: "Comision A", student_count: 5 }];

  // Update reactive mock parameters and url
  mockParams = {
    faculty_id: "1",
    subject_id: "2",
    period_id: "3",
    commission_id: "4",
  };
  mockUrl = new URL("http://localhost/faculties/1/subjects/2/periods/3/commissions/4/overview");

  const crumbs = navStore.breadcrumbs;

  expect(crumbs).toHaveLength(6);
  expect(crumbs[0]).toEqual({ key: "layout.home", href: "/" });
  expect(crumbs[1]).toEqual({ key: "Facultad A", href: "/faculties/1", isRaw: true });
  expect(crumbs[2]).toEqual({ key: "Materia A", href: "/faculties/1/subjects/2", isRaw: true });
  expect(crumbs[3]).toEqual({ key: "2026 - 1º", href: "/subjects/2/periods/3", isRaw: true });
  expect(crumbs[4]).toEqual({ key: "Comision A", href: "/periods/3/commissions/4", isRaw: true });
  expect(crumbs[5]).toEqual({
    key: "layout.overview",
    href: "/faculties/1/subjects/2/periods/3/commissions/4/overview",
  });
});

test("navStore.breadcrumbs includes faculties subpath step when no specific faculty_id is present", async () => {
  await loadTranslations("en", "/");

  mockUrl = new URL("http://localhost/faculties");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs).toHaveLength(2);
  expect(crumbs[1]).toEqual({ key: "layout.faculties", href: "/faculties" });
});

test("navStore.breadcrumbs includes subjects subpath step when no specific subject_id is present", async () => {
  await loadTranslations("en", "/");

  mockUrl = new URL("http://localhost/subjects");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs).toHaveLength(2);
  expect(crumbs[1]).toEqual({ key: "layout.subjects", href: "/subjects" });
});
