import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import DashboardPending from "./DashboardPending.svelte";

configure({ testIdAttribute: "data-test-id" });

const periodLabel = "2025 · 1º";

const rows = [
  {
    id: 4,
    subjectName: "Álgebra Lineal",
    commissionName: "Comisión Mañana",
    pendingCount: 5,
    href: "/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/overview",
  },
  {
    id: 5,
    subjectName: "Análisis Matemático I",
    commissionName: "Comisión Tarde",
    pendingCount: 2,
    href: "/faculties/ingenieria/subjects/analisis-matematico-i/periods/2025/1/commissions/comision-tarde/overview",
  },
];

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

beforeEach(async () => {
  await loadTranslations("es", "/");
});

test("lists the commissions with pending corrections and their scope", () => {
  render(DashboardPending, { rows, periodLabel });

  expect(screen.getByTestId("pending-scope").textContent).toContain("2025 · 1º");
  expect(screen.getByTestId("pending-row-4").textContent).toContain("Álgebra Lineal");
  expect(screen.getByTestId("pending-row-4").textContent).toContain("5");
  expect(screen.getByTestId("pending-row-5").textContent).toContain("2");
  expect(screen.getByTestId("pending-open-4")).toHaveAttribute("href", rows[0].href);
});

test("shows the empty state when nothing is waiting for correction", () => {
  render(DashboardPending, { rows: [], periodLabel });

  expect(screen.getByTestId("pending-empty").textContent).toContain(
    "No hay entregas sin corregir",
  );
  expect(document.querySelector('[data-test-id^="pending-row-"]')).toBeNull();
});

test("offers a retry when counting failed", async () => {
  const onRetry = vi.fn();
  render(DashboardPending, { rows: [], periodLabel, failed: true, onRetry });

  const retry = screen.getByRole("button", { name: "Reintentar" });
  retry.click();
  expect(onRetry).toHaveBeenCalledOnce();
});
