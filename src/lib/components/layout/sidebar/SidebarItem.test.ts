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
