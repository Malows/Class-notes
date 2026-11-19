import { loadTranslations } from "$lib/common/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, beforeEach, vi } from "vitest";

let mockPathname = "/";

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get url() {
          return { pathname: mockPathname };
        },
      };
    },
  };
});

import SidebarStaticLinks from "./SidebarStaticLinks.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  mockPathname = "/";
});

beforeEach(() => {
  mockPathname = "/";
});

test("Links renderizan", async () => {
  await loadTranslations("en", "/");
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();
  expect(document.body.textContent).toContain("In class");
  expect(document.body.textContent).toContain("Periods");
});

test("includes the students registry quick access link", async () => {
  await loadTranslations("en", "/");
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();

  const links = [...document.body.querySelectorAll("a")].map((anchor) =>
    anchor.getAttribute("href"),
  );
  expect(links).toContain("/persons");
  expect(document.body.textContent).toContain("Students");
});

test("marks the exact section path as the current page", async () => {
  mockPathname = "/faculties/";
  await loadTranslations("en", "/");
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();

  const faculties = document.body.querySelector('a[href="/faculties"]');
  expect(faculties?.getAttribute("aria-current")).toBe("page");
});

test("marks a parent section as current without claiming it is the page", async () => {
  mockPathname = "/faculties/facultad-de-ingenieria/subjects";
  await loadTranslations("en", "/");
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();

  const faculties = document.body.querySelector('a[href="/faculties"]');
  expect(faculties?.getAttribute("aria-current")).toBe("true");

  const dashboard = document.body.querySelector('a[href="/"]');
  expect(dashboard?.hasAttribute("aria-current")).toBe(false);
});
