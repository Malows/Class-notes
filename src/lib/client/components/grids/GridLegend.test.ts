import "@testing-library/jest-dom/vitest";
import { configure, render, screen } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import GridLegend from "./GridLegend.svelte";

configure({ testIdAttribute: "data-test-id" });

function legendText() {
  return screen.getByTestId("grid-legend").textContent ?? "";
}

describe("GridLegend", () => {
  test("renders the attendance legend expanded, never as a disclosure", async () => {
    await loadTranslations("es", "/");

    render(GridLegend, { variant: "attendance" });

    const legend = screen.getByTestId("grid-legend");
    expect(legend.tagName).toBe("SECTION");
    expect(document.querySelector("details")).toBeNull();
    expect(legendText()).toContain("Leyenda");
    expect(legendText()).toContain("Presente");
    expect(legendText()).toContain("Ausente");
    expect(legendText()).toContain("Sin tomar");
    expect(legendText()).toContain("3 / 4 = presentes / registradas");
    expect(legend.querySelectorAll(".grid-legend__mark")).toHaveLength(3);
  });

  test("explains every overview mark and the AI chip", async () => {
    await loadTranslations("es", "/");

    render(GridLegend, { variant: "overview", testId: "overview-legend" });

    const text = screen.getByTestId("overview-legend").textContent ?? "";
    expect(text).toContain("Aprobado");
    expect(text).toContain("No aprobado");
    expect(text).toContain("Pendiente de corrección");
    expect(text).toContain("Sin entregar");
    expect(text).toContain("Sospecha de IA");
    expect(text).toContain("IA!");
    expect(text).toContain("Certeza de IA");
    expect(text).toContain("IA!!");
    expect(text).not.toContain("3 / 4");
  });

  test("uses the same vocabulary in English", async () => {
    await loadTranslations("en", "/");

    render(GridLegend, { variant: "attendance" });

    const text = legendText();
    expect(text).toContain("Legend");
    expect(text).toContain("Not taken");
    expect(text).toContain("3 / 4 = present / recorded");
  });
});
