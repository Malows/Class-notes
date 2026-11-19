import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import StatItem from "./StatItem.svelte";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("StatItem renderiza label y valor sin tono", () => {
  component = mount(StatItem, {
    target: document.body,
    props: {
      label: "Test Label",
      value: 100,
    },
  });

  flushSync();

  expect(document.body.textContent).toContain("Test Label");
  const value = document.body.querySelector(".stat-value");
  expect(value?.textContent).toContain("100");
  expect(value?.querySelector(".stat-tone")).toBeNull();
});

test("StatItem renderiza el tono como indicador separado", () => {
  component = mount(StatItem, {
    target: document.body,
    props: {
      label: "Test Label",
      value: 100,
      badge: "warning",
    },
  });

  flushSync();

  const value = document.body.querySelector(".stat-value");
  expect(value?.textContent).toContain("100");
  const tone = document.body.querySelector(".stat-tone");
  expect(tone).not.toBeNull();
  expect(tone?.getAttribute("data-tone")).toBe("warning");
});
