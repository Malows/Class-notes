import { expect, test, vi, beforeEach } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
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
    faculty_id: "1",
    subject_id: "2",
    period_id: "3",
    commission_id: "4",
  };
  mockUrl = new URL("http://localhost/faculties/1/subjects/2/periods/3/commissions/4/overview");

  const crumbs = navStore.breadcrumbs;

  expect(crumbs).toHaveLength(6);
  expect(crumbs[0]).toEqual({ key: "layout.home", href: "/" });
  expect(crumbs[1]).toEqual({ key: "layout.faculties", href: "/faculties" });
  expect(crumbs[2]).toEqual({ key: "layout.subjects", href: "/faculties/1/subjects" });
  expect(crumbs[3]).toEqual({ key: "layout.periods", href: "/faculties/1/subjects/2/periods" });
  expect(crumbs[4]).toEqual({
    key: "layout.commissions",
    href: "/faculties/1/subjects/2/periods/3/commissions",
  });
  expect(crumbs[5]).toEqual({
    key: "layout.overview",
    href: "/faculties/1/subjects/2/periods/3/commissions/4/overview",
  });
});

test("navStore.breadcrumbs includes faculties subpath step when faculties is present", async () => {
  await loadTranslations("en", "/");

  mockUrl = new URL("http://localhost/faculties");

  const crumbs = navStore.breadcrumbs;
  expect(crumbs).toHaveLength(2);
  expect(crumbs[1]).toEqual({ key: "layout.faculties", href: "/faculties" });
});
