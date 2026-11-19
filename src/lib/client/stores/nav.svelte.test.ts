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
  expect(navStore.breadcrumbs[0]).toEqual({ kind: "home", key: "layout.home", href: "/" });
});

test("navStore.breadcrumbs names every level of the cursada instead of route types", async () => {
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

  expect(crumbs).toHaveLength(5);
  expect(crumbs[0]).toEqual({
    kind: "faculty",
    key: "layout.faculty",
    slug: "facultad-de-ingenieria",
    href: "/faculties/facultad-de-ingenieria/subjects",
  });
  expect(crumbs[1]).toEqual({
    kind: "subject",
    key: "layout.subject",
    slug: "algebra-lineal",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods",
  });
  expect(crumbs[2]).toEqual({
    kind: "period",
    key: "layout.period",
    year: 2026,
    semester: 1,
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions",
  });
  expect(crumbs[3]).toEqual({
    kind: "commission",
    key: "layout.commission",
    slug: "comision-manana",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/overview",
  });
  expect(crumbs[4]).toEqual({
    kind: "section",
    key: "layout.overview",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/overview",
  });
});

test("navStore.breadcrumbs collapses to the faculty name on the faculty index", async () => {
  await loadTranslations("en", "/");

  mockUrl = new URL("http://localhost/faculties");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs).toHaveLength(2);
  expect(crumbs[0]).toEqual({ kind: "home", key: "layout.home", href: "/" });
  expect(crumbs[1]).toEqual({ kind: "section", key: "layout.faculties", href: "/faculties" });
});

test("navStore.breadcrumbs names the faculty and the subjects section on its index", async () => {
  await loadTranslations("en", "/");

  mockParams = { faculty: "facultad-de-ingenieria" };
  mockUrl = new URL("http://localhost/faculties/facultad-de-ingenieria/subjects");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs).toHaveLength(2);
  expect(crumbs[0]?.kind).toBe("faculty");
  expect(crumbs[0]?.slug).toBe("facultad-de-ingenieria");
  expect(crumbs[1]).toEqual({
    kind: "section",
    key: "layout.subjects",
    href: "/faculties/facultad-de-ingenieria/subjects",
  });
});

test("navStore.breadcrumbs names the subject and the periods section", async () => {
  await loadTranslations("en", "/");

  mockParams = { faculty: "facultad-de-ingenieria", subject: "algebra-lineal" };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods",
  );

  const crumbs = navStore.breadcrumbs;
  expect(crumbs.map((crumb) => crumb.kind)).toEqual(["faculty", "subject", "section"]);
  expect(crumbs.at(-1)).toEqual({
    kind: "section",
    key: "layout.periods",
    href: "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods",
  });
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

  const crumbs = navStore.breadcrumbs;
  expect(crumbs.map((crumb) => crumb.kind)).toEqual([
    "faculty",
    "subject",
    "period",
    "commission",
    "section",
  ]);
  expect(crumbs.at(-1)).toEqual({
    kind: "section",
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
  expect(navStore.breadcrumbs[0]).toEqual({ kind: "home", key: "layout.home", href: "/" });
  expect(navStore.breadcrumbs.at(-1)).toEqual({
    kind: "section",
    key: "persons.index_title",
    href: "/persons",
  });

  mockUrl = new URL("http://localhost/persons/7");
  expect(navStore.breadcrumbs.at(-1)?.key).toBe("persons.detail_title");
});

test("navStore.breadcrumbs labels a global period with its year and semester", async () => {
  await loadTranslations("en", "/");

  mockParams = { year: "2026", semester: "2" };
  mockUrl = new URL("http://localhost/periods/2026/2/subjects");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs.map((crumb) => crumb.kind)).toEqual(["home", "section", "period"]);
  expect(crumbs.at(-1)).toEqual({
    kind: "period",
    key: "layout.period",
    year: 2026,
    semester: 2,
    href: "/periods/2026/2/subjects",
  });
});
