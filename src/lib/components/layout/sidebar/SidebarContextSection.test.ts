import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";
import SidebarContextSection from "./SidebarContextSection.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Section renderiza titulo e items", () => {
  component = mount(SidebarContextSection, {
    target: document.body,
    props: {
      heading: "Test Heading",
      isCollapsed: false,
      items: [{ id: 1, href: "/a", label: "A", shortLabel: "A", isActive: false }],
    },
  });
  flushSync();
  expect(document.body.textContent).toContain("Test Heading");
  expect(document.body.textContent).toContain("A");
});
