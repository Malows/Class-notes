import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";
import SidebarStaticLinks from "./SidebarStaticLinks.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Links renderizan", () => {
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();
  expect(document.body.textContent).toContain("Dashboard");
});
