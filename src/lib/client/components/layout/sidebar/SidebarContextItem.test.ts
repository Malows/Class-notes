import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi } from "vitest";

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

import SidebarContextItem from "./SidebarContextItem.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  mockPathname = "/";
});

test("Item renderiza correctamente", () => {
  component = mount(SidebarContextItem, {
    target: document.body,
    props: {
      href: "/a",
      label: "Label",
      shortLabel: "L",
      isCollapsed: false,
      isActive: false,
    },
  });
  flushSync();
  const a = document.body.querySelector("a");
  expect(a?.textContent).toContain("Label");
  expect(a?.getAttribute("href")).toBe("/a");
  expect(a?.hasAttribute("aria-current")).toBe(false);
});

test("marca aria-current=true cuando el item pertenece al conjunto pero no es la página actual", () => {
  mockPathname = "/faculties/f/subjects/s/periods/2026/1/commissions/c/correct";

  component = mount(SidebarContextItem, {
    target: document.body,
    props: {
      href: "/faculties/f/subjects/s/periods/2026/1/commissions/c/overview",
      label: "Comisión A",
      shortLabel: "CO",
      isCollapsed: false,
      isActive: true,
    },
  });
  flushSync();

  expect(document.body.querySelector("a")?.getAttribute("aria-current")).toBe("true");
});

test("marca aria-current=page solo cuando el href coincide con la ruta, con o sin barra final", () => {
  mockPathname = "/faculties/f/subjects/s/periods/2026/1/commissions/";

  component = mount(SidebarContextItem, {
    target: document.body,
    props: {
      href: "/faculties/f/subjects/s/periods/2026/1/commissions",
      label: "2026 - 1º",
      shortLabel: "26-1",
      isCollapsed: false,
      isActive: true,
    },
  });
  flushSync();

  expect(document.body.querySelector("a")?.getAttribute("aria-current")).toBe("page");
});
