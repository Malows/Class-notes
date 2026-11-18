import { loadTranslations } from "$lib/common/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

let mockUrl = new URL("http://localhost/");

vi.mock("$app/state", () => ({
  get page() {
    return {
      get url() {
        return mockUrl;
      },
    };
  },
}));

import BottomNav from "./BottomNav.svelte";

let component: ReturnType<typeof mount>;

beforeEach(async () => {
  await loadTranslations("en", "/");
  mockUrl = new URL("http://localhost/");
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("renders the four primary destinations", () => {
  component = mount(BottomNav, { target: document.body });
  flushSync();

  const links = [...document.body.querySelectorAll("a")];
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    "/",
    "/faculties",
    "/periods",
    "/persons",
  ]);
  expect(document.body.textContent).toContain("Faculties");
  expect(document.body.textContent).toContain("Students");
});

test("marks the current destination for assistive technology", () => {
  mockUrl = new URL("http://localhost/faculties/facultad-de-ingenieria/subjects");
  component = mount(BottomNav, { target: document.body });
  flushSync();

  const faculties = document.body.querySelector(
    '[data-test-id="bottom-nav-faculties"]',
  ) as HTMLAnchorElement;
  const dashboard = document.body.querySelector(
    '[data-test-id="bottom-nav-dashboard"]',
  ) as HTMLAnchorElement;

  expect(faculties.getAttribute("aria-current")).toBe("page");
  expect(dashboard.getAttribute("aria-current")).toBeNull();
});
