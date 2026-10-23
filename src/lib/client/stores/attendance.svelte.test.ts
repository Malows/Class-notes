import { describe, it, expect, vi, beforeEach } from "vitest";

import { AttendanceStatus } from "$lib/common/types/attendance";
import type { AttendanceGrid } from "$lib/common/types/attendance";

import { AttendanceStore } from "./attendance.svelte";

const grid = (): AttendanceGrid => ({
  scope: "commission",
  subject: { id: 1, name: "Álgebra Lineal", slug: "algebra-lineal", faculty_slug: "facultad" },
  period: { id: 2, year: 2025, semester: 1 },
  commission: { id: 1, name: "Comisión Mañana", slug: "comision-manana" },
  commissions: [],
  assignments: [
    { id: 10, subject_period_id: 1, title: "TP 1" },
    { id: 11, subject_period_id: 1, title: "TP 2" },
  ],
  rows: [
    {
      enrollment_id: 1,
      person_id: 1,
      name: "Ana",
      legajo: null,
      commission_id: 1,
      commission_name: "Comisión Mañana",
      commission_slug: "comision-manana",
      is_guest: false,
      present_count: 0,
      taken_count: 0,
      cells: [
        { assignment_id: 10, enrollment_id: 1, status: null, recorded_on: null, commission_id: null },
        { assignment_id: 11, enrollment_id: 1, status: null, recorded_on: null, commission_id: null },
      ],
    },
  ],
  columns: [
    { assignment_id: 10, present_count: 0, taken_count: 0 },
    { assignment_id: 11, present_count: 0, taken_count: 0 },
  ],
});

describe("AttendanceStore", () => {
  let store: AttendanceStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getGridByCommission: vi.fn(),
      getGridByCursada: vi.fn(),
      mark: vi.fn(),
      unmark: vi.fn(),
      bulk: vi.fn(),
    };
    store = new AttendanceStore(mockService);
  });

  it("loads the commission grid", async () => {
    mockService.getGridByCommission.mockResolvedValue(grid());

    await store.loadCommission(1);

    expect(mockService.getGridByCommission).toHaveBeenCalledWith(1);
    expect(store.loaded).toBe(true);
    expect(store.grid?.scope).toBe("commission");
  });

  it("loads the cursada grid", async () => {
    mockService.getGridByCursada.mockResolvedValue({ ...grid(), scope: "cursada" });

    await store.loadCursada(1);

    expect(mockService.getGridByCursada).toHaveBeenCalledWith(1);
    expect(store.grid?.scope).toBe("cursada");
  });

  it("applies a decision without a reload and updates both summaries", async () => {
    mockService.getGridByCommission.mockResolvedValue(grid());
    await store.loadCommission(1);

    mockService.mark.mockResolvedValue({
      assignment_id: 10,
      enrollment_id: 1,
      subject_period_id: 1,
      commission_id: 1,
      status: AttendanceStatus.PRESENT,
      recorded_on: "2026-10-23",
    });

    await store.mark(10, 1, AttendanceStatus.PRESENT, 1);

    expect(store.grid?.rows[0]?.cells[0]?.status).toBe(AttendanceStatus.PRESENT);
    expect(store.grid?.rows[0]?.present_count).toBe(1);
    expect(store.grid?.rows[0]?.taken_count).toBe(1);
    expect(store.grid?.columns.find((c) => c.assignment_id === 10)?.present_count).toBe(1);
    expect(store.grid?.columns.find((c) => c.assignment_id === 11)?.taken_count).toBe(0);
  });

  it("unmarks a decision back to the not-taken state", async () => {
    mockService.getGridByCommission.mockResolvedValue(grid());
    await store.loadCommission(1);

    mockService.mark.mockResolvedValue({
      assignment_id: 10,
      enrollment_id: 1,
      subject_period_id: 1,
      commission_id: 1,
      status: AttendanceStatus.ABSENT,
      recorded_on: "2026-10-23",
    });
    await store.mark(10, 1, AttendanceStatus.ABSENT, 1);

    mockService.unmark.mockResolvedValue(undefined);
    await store.unmark(10, 1);

    expect(store.grid?.rows[0]?.cells[0]?.status).toBeNull();
    expect(store.grid?.rows[0]?.taken_count).toBe(0);
    expect(store.grid?.columns.find((c) => c.assignment_id === 10)?.taken_count).toBe(0);
  });

  it("marks every roster row present in one bulk", async () => {
    mockService.getGridByCommission.mockResolvedValue(grid());
    await store.loadCommission(1);

    mockService.bulk.mockResolvedValue([
      {
        assignment_id: 10,
        enrollment_id: 1,
        subject_period_id: 1,
        commission_id: 1,
        status: AttendanceStatus.PRESENT,
        recorded_on: "2026-10-23",
      },
    ]);

    const records = await store.bulkMarkPresent(10, 1);

    expect(mockService.bulk).toHaveBeenCalledWith(10, 1, [
      { enrollment_id: 1, status: AttendanceStatus.PRESENT },
    ]);
    expect(records).toHaveLength(1);
    expect(store.grid?.rows[0]?.cells[0]?.status).toBe(AttendanceStatus.PRESENT);
  });
});
