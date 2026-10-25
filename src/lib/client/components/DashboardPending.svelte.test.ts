import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";
import type { PendingSummary } from "$lib/common/types/dashboard";

configure({ testIdAttribute: "data-test-id" });

const { getPendingSummaryMock } = vi.hoisted(() => ({
  getPendingSummaryMock: vi.fn(),
}));

vi.mock("$lib/client/services/overview.service", () => ({
  overviewService: { getPendingSummary: getPendingSummaryMock },
}));

import DashboardPending from "./DashboardPending.svelte";

const base = {
  commission_slug: "comision",
  faculty_id: 1,
  faculty_slug: "facultad-de-ingenieria",
  period_id: 1,
  period_year: 2025,
  period_semester: 1,
};

const pendingItems: PendingSummary[] = [
  {
    ...base,
    commission_id: 4,
    commission_name: "Comisión Mañana",
    commission_slug: "comision-manana",
    subject_id: 1,
    subject_name: "Álgebra Lineal",
    subject_slug: "algebra-lineal",
    pending_count: 5,
  },
  {
    ...base,
    commission_id: 5,
    commission_name: "Comisión Tarde",
    commission_slug: "comision-tarde",
    subject_id: 1,
    subject_name: "Álgebra Lineal",
    subject_slug: "algebra-lineal",
    pending_count: 2,
  },
  {
    ...base,
    commission_id: 6,
    commission_name: "Comisión Única",
    commission_slug: "comision-unica",
    subject_id: 2,
    subject_name: "Análisis Matemático I",
    subject_slug: "analisis-matematico-i",
    period_semester: 2,
    pending_count: 3,
  },
];

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

beforeEach(async () => {
  await loadTranslations("es", "/");
});

test("groups pending commissions under one entry per subject", async () => {
  getPendingSummaryMock.mockResolvedValue(pendingItems);

  render(DashboardPending);
  await flush();

  const subjectGroups = document.querySelectorAll('[data-test-id^="pending-subject-group-"]');
  expect(subjectGroups).toHaveLength(2);

  expect(screen.getByTestId("pending-subject-1").textContent).toContain("Álgebra Lineal");
  expect(screen.getByTestId("pending-subject-total-1").textContent).toContain("7");
  expect(screen.getByTestId("pending-subject-2").textContent).toContain("Análisis Matemático I");
  expect(screen.getByTestId("pending-subject-total-2").textContent).toContain("3");

  const algebraRows = screen
    .getByTestId("pending-commissions-1")
    .querySelectorAll('[data-test-id^="pending-row-"]');
  expect(algebraRows).toHaveLength(2);
  expect(screen.getByTestId("pending-commission-4").textContent).toContain("Comisión Mañana");
  expect(screen.getByTestId("pending-commission-5").textContent).toContain("Comisión Tarde");

  expect(screen.getByTestId("view-pending-btn-4")).toHaveAttribute(
    "href",
    "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/overview",
  );
});

test("shows the empty state when there are no pending commissions", async () => {
  getPendingSummaryMock.mockResolvedValue([]);

  render(DashboardPending);
  await flush();

  expect(document.querySelectorAll('[data-test-id^="pending-subject-group-"]')).toHaveLength(0);
  expect(document.body.textContent).toContain("período vigente");
});