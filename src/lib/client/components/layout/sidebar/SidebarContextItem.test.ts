import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import SidebarContextItem from "./SidebarContextItem.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
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
});
