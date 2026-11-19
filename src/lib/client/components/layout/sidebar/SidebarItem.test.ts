import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import SidebarItem from "./SidebarItem.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Item renderiza", () => {
  component = mount(SidebarItem, {
    target: document.body,
    props: { title: "Test", href: "/t", isCollapsed: false, icon: "X" },
  });
  flushSync();
  expect(document.body.textContent).toContain("Test");
});

test("usa aria-current explícito para el elemento del conjunto", () => {
  component = mount(SidebarItem, {
    target: document.body,
    props: {
      title: "Facultades",
      href: "/faculties",
      isCollapsed: false,
      icon: "account_balance",
      active: true,
      ariaCurrent: "true",
    },
  });
  flushSync();

  const link = document.body.querySelector("a");
  expect(link?.getAttribute("aria-current")).toBe("true");
});

test("conserva aria-current=page cuando solo recibe active", () => {
  component = mount(SidebarItem, {
    target: document.body,
    props: {
      title: "Periodos",
      href: "/periods",
      isCollapsed: false,
      icon: "calendar_month",
      active: true,
    },
  });
  flushSync();

  expect(document.body.querySelector("a")?.getAttribute("aria-current")).toBe("page");
});
