import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./+server";

const { getGridByCommissionMock, getGridByCursadaMock } = vi.hoisted(() => ({
  getGridByCommissionMock: vi.fn(),
  getGridByCursadaMock: vi.fn(),
}));

vi.mock("$lib/server/services/attendance.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/server/services/attendance.service")>();
  return {
    ...actual,
    attendanceService: {
      getGridByCommission: getGridByCommissionMock,
      getGridByCursada: getGridByCursadaMock,
    },
  };
});

const grid = {
  scope: "commission",
  subject: { id: 1, name: "Álgebra Lineal", slug: "algebra-lineal", faculty_slug: "f" },
  period: { id: 2, year: 2025, semester: 1 },
  commission: { id: 1, name: "Comisión Mañana", slug: "comision-manana" },
  commissions: [],
  assignments: [],
  rows: [],
  columns: [],
};

describe("attendance collection API", () => {
  beforeEach(() => {
    getGridByCommissionMock.mockReset();
    getGridByCursadaMock.mockReset();
  });

  it("rejects a request without a scope", async () => {
    const response = await GET({ url: new URL("http://localhost/api/v1/attendance") } as any);

    expect(response.status).toBe(400);
  });

  it("returns the commission grid", async () => {
    getGridByCommissionMock.mockReturnValue(grid);

    const response = await GET({
      url: new URL("http://localhost/api/v1/attendance?commission_id=1"),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getGridByCommissionMock).toHaveBeenCalledWith(1);
    expect(body.data.scope).toBe("commission");
  });

  it("returns 404 for an unknown commission", async () => {
    getGridByCommissionMock.mockReturnValue(null);

    const response = await GET({
      url: new URL("http://localhost/api/v1/attendance?commission_id=999"),
    } as any);

    expect(response.status).toBe(404);
  });

  it("returns the cursada grid", async () => {
    getGridByCursadaMock.mockReturnValue({ ...grid, scope: "cursada" });

    const response = await GET({
      url: new URL("http://localhost/api/v1/attendance?subject_period_id=1"),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getGridByCursadaMock).toHaveBeenCalledWith(1);
    expect(body.data.scope).toBe("cursada");
  });
});
