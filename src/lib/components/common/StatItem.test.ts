import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";
import StatItem from "./StatItem.svelte";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("StatItem renderizado con label y valor", () => {
  component = mount(StatItem, {
    target: document.body,
    props: {
      label: "Test Label",
      value: 100,
    },
  });

  flushSync();

  expect(document.body.textContent).toContain("Test Label");
  expect(document.body.textContent).toContain("100");

  const span = document.body.querySelector("span");
  expect(span?.className).not.toContain("badge");
});

test("StatItem renderizado con badge", () => {
  component = mount(StatItem, {
    target: document.body,
    props: {
      label: "Test Label",
      value: 100,
      badge: "warning",
    },
  });

  flushSync();

  const span = document.body.querySelector("span");
  expect(span?.className).toContain("badge");
  expect(span?.className).toContain("warning");
});
