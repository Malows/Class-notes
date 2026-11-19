import "@testing-library/jest-dom/vitest";
import { configure, render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";

import EmptyState from "./EmptyState.svelte";

configure({ testIdAttribute: "data-test-id" });

test("draws the quiet not-taken mark instead of rendering a caller emoji", () => {
  render(EmptyState, {
    icon: "✏️",
    title: "Todavía no hay trabajos prácticos",
    testId: "empty-state",
  });

  const card = screen.getByTestId("empty-state");
  expect(card.textContent).not.toContain("✏️");
  expect(screen.getByTestId("empty-state-mark")).toBeInTheDocument();
  expect(card.querySelector("svg")).toBeNull();
});

test("keeps the title, description and actions", () => {
  render(EmptyState, {
    title: "Sin alumnos",
    description: "Inscribí el primero para empezar.",
    testId: "empty-state",
  });

  const card = screen.getByTestId("empty-state");
  expect(card.textContent).toContain("Sin alumnos");
  expect(card.textContent).toContain("Inscribí el primero para empezar.");
});
