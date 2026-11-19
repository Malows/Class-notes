import { expect, test, vi, beforeEach } from "vitest";
import { loadTranslations } from "$lib/common/i18n/config";
import { navStore } from "./nav.svelte";

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

beforeEach(() => {
  vi.restoreAllMocks();
  mockParams = {};
  mockUrl = new URL("http://localhost/");
});

test("navStore.breadcrumbs renders root Home breadcrumb by default", async () => {
  await loadTranslations("en", "/");

  expect(navStore.breadcrumbs).toHaveLength(1);
  expect(navStore.breadcrumbs[0]?.key).toBe("layout.home");
  expect(navStore.breadcrumbs[0]?.href).toBe("/");
});

test("navStore.breadcrumbs dynamically builds static index breadcrumbs", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "1",
    commission: "comision-manana",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/overview",
  );

  const crumbs = navStore.breadcrumbs;

  expect(crumbs).toHaveLength(6);
  expect(crumbs[0]).toEqual({ key: "layout.home", href: "/" });
  expect(crumbs[1]).toEqual({ key: "layout.faculties", href: "/faculties" });
  expect(crumbs[2]).toEqual({
    key: "layout.subjects",
    href: "/faculties/facultad-de-ingenieria/subjects",
  });
  expect(crumbs[3]).toEqual({
    key: "layout.periods",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods",
  });
  expect(crumbs[4]).toEqual({
    key: "layout.commissions",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions",
  });
  expect(crumbs[5]).toEqual({
    key: "layout.overview",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/overview",
  });
});

test("navStore.breadcrumbs includes faculties subpath step when faculties is present", async () => {
  await loadTranslations("en", "/");

  mockUrl = new URL("http://localhost/faculties");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs).toHaveLength(2);
  expect(crumbs[1]).toEqual({ key: "layout.faculties", href: "/faculties" });
});

test("navStore.breadcrumbs names the commission attendance view", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "1",
    commission: "comision-manana",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/attendance",
  );

  const last = navStore.breadcrumbs.at(-1);
  expect(last).toEqual({
    key: "attendance.commission_title",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/attendance",
  });
});

test("navStore.breadcrumbs names take mode and the cursada attendance view", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "1",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/attendance",
  );
  expect(navStore.breadcrumbs.at(-1)?.key).toBe("attendance.cursada_title");

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "1",
    commission: "comision-manana",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/attendance/take?assignment_id=1",
  );
  expect(navStore.breadcrumbs.at(-1)?.key).toBe("attendance.take_title");
});

test("navStore.breadcrumbs names the period overview", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "1",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/overview",
  );

  expect(navStore.breadcrumbs.at(-1)?.key).toBe("periods.period_overview_title");
});

test("navStore.breadcrumbs names the students registry and a person detail", async () => {
  await loadTranslations("en", "/");

  mockUrl = new URL("http://localhost/persons");
  expect(navStore.breadcrumbs.at(-1)).toEqual({
    key: "persons.index_title",
    href: "/persons",
  });

  mockUrl = new URL("http://localhost/persons/7");
  expect(navStore.breadcrumbs.at(-1)?.key).toBe("persons.detail_title");
});
