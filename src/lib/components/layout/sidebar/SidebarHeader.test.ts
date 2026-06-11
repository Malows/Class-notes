import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi } from "vitest";
import SidebarHeader from "./SidebarHeader.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Header renderiza y responde a toggle", () => {
  const toggleSpy = vi.fn();
  component = mount(SidebarHeader, {
    target: document.body,
    props: { isCollapsed: false, onToggle: toggleSpy },
  });
  flushSync();
  document.body.querySelector("button")?.click();
  expect(toggleSpy).toHaveBeenCalled();
});
