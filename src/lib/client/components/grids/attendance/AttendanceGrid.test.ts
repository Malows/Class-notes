import { loadTranslations } from "$lib/common/i18n/config";
import { render, screen, fireEvent, configure } from "@testing-library/svelte";
import { expect, test, afterEach, vi } from "vitest";

import { AttendanceStatus } from "$lib/common/types/attendance";
import type { AttendanceGrid as AttendanceGridData } from "$lib/common/types/attendance";

import AttendanceGrid from "./AttendanceGrid.svelte";

configure({ testIdAttribute: "data-test-id" });

afterEach(() => {
  document.body.innerHTML = "";
});

const baseGrid = (): AttendanceGridData => ({
  scope: "commission",
  subject: { id: 1, name: "Álgebra Lineal", slug: "algebra-lineal", faculty_slug: "facultad" },
  period: { id: 2, year: 2025, semester: 1 },
  commission: { id: 1, name: "Comisión Mañana", slug: "comision-manana" },
  commissions: [
    { id: 1, name: "Comisión Mañana", slug: "comision-manana" },
    { id: 2, name: "Comisión Tarde", slug: "comision-tarde" },
  ],
  assignments: [
    { id: 10, subject_period_id: 1, title: "TP 1" },
    { id: 11, subject_period_id: 1, title: "TP 2" },
  ],
  rows: [
    {
      enrollment_id: 1,
      person_id: 1,
      name: "Ana Martínez",
      legajo: "ING-004",
      commission_id: 1,
      commission_name: "Comisión Mañana",
      commission_slug: "comision-manana",
      is_guest: false,
      present_count: 1,
      taken_count: 1,
      cells: [
        {
          assignment_id: 10,
          enrollment_id: 1,
          status: AttendanceStatus.PRESENT,
          recorded_on: "2026-10-23",
          commission_id: 1,
        },
        {
          assignment_id: 11,
          enrollment_id: 1,
          status: null,
          recorded_on: null,
          commission_id: null,
        },
      ],
    },
    {
      enrollment_id: 5,
      person_id: 5,
      name: "Luis Fernández",
      legajo: "ING-005",
      commission_id: 2,
      commission_name: "Comisión Tarde",
      commission_slug: "comision-tarde",
      is_guest: true,
      present_count: 1,
      taken_count: 1,
      cells: [
        {
          assignment_id: 10,
          enrollment_id: 5,
          status: AttendanceStatus.ABSENT,
          recorded_on: "2026-10-23",
          commission_id: 1,
        },
        {
          assignment_id: 11,
          enrollment_id: 5,
          status: null,
          recorded_on: null,
          commission_id: null,
        },
      ],
    },
  ],
  columns: [
    { assignment_id: 10, present_count: 1, taken_count: 2 },
    { assignment_id: 11, present_count: 0, taken_count: 0 },
  ],
});

test("renders the commission grid with cells, guests and summaries", async () => {
  await loadTranslations("es", "/");

  render(AttendanceGrid, { grid: baseGrid(), canEdit: false });

  expect(screen.getByTestId("attendance-grid")).toBeTruthy();
  expect(screen.getByText("Ana Martínez")).toBeTruthy();
  expect(screen.getByTestId("attendance-cell-1-10").textContent?.trim()).toBe("✓");
  expect(screen.getByTestId("attendance-cell-1-11").textContent?.trim()).toBe("–");
  expect(screen.getByTestId("attendance-cell-5-10").textContent?.trim()).toBe("✗");

  const guest = screen.getByTestId("attendance-guest-5");
  expect(guest.textContent).toContain("Invitado");
  expect(guest.textContent).toContain("Comisión Tarde");

  expect(screen.getByTestId("attendance-row-summary-1").textContent?.trim()).toBe("1 / 1");
  expect(screen.getByTestId("attendance-column-10").textContent?.trim()).toBe("1 / 2");
  expect(screen.getByTestId("attendance-empty-column-11")).toBeTruthy();
});

test("labels the commission of each row in the cursada scope", async () => {
  await loadTranslations("es", "/");
  const grid = { ...baseGrid(), scope: "cursada" as const, commission: null };

  render(AttendanceGrid, { grid, canEdit: false });

  expect(screen.getByTestId("attendance-commission-1").textContent).toContain(
    "Comisión Mañana",
  );
});

test("labels an enrollment without commission in the cursada scope", async () => {
  await loadTranslations("es", "/");
  const grid = baseGrid();
  grid.scope = "cursada";
  grid.commission = null;
  grid.rows[0]!.commission_id = null;
  grid.rows[0]!.commission_name = null;
  grid.rows[0]!.commission_slug = null;

  render(AttendanceGrid, { grid, canEdit: false });

  expect(screen.getByTestId("attendance-commission-1").textContent).toContain("Sin comisión");
});

test("cycles a cell when editing is enabled", async () => {
  await loadTranslations("es", "/");
  const onCycleCell = vi.fn();

  render(AttendanceGrid, { grid: baseGrid(), canEdit: true, onCycleCell });

  await fireEvent.click(screen.getByTestId("attendance-cell-1-11"));

  expect(onCycleCell).toHaveBeenCalledWith(11, 1, null);
});

test("links each assignment to take mode when a href builder is given", async () => {
  await loadTranslations("es", "/");

  render(AttendanceGrid, {
    grid: baseGrid(),
    canEdit: true,
    takeHref: (assignmentId: number) => `/take?assignment_id=${assignmentId}`,
  });

  const link = screen.getByText("TP 1").closest("a");
  expect(link?.getAttribute("href")).toBe("/take?assignment_id=10");
});
