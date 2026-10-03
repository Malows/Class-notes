import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./+server";

const { getAllMock, getByYearSemesterMock, createMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  getByYearSemesterMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("$lib/server/services/period.service", async () => {
  return {
    periodService: {
      getAll: getAllMock,
      getByYearSemester: getByYearSemesterMock,
      create: createMock,
    },
  };
});

describe("periods collection API", () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getByYearSemesterMock.mockReset();
    createMock.mockReset();
  });

  it("lists all periods when no filter is provided", async () => {
    getAllMock.mockReturnValue([{ id: 1, year: 2026, semester: 1 }]);

    const response = await GET({ url: new URL("http://localhost/api/v1/periods") } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getAllMock).toHaveBeenCalledWith(undefined);
    expect(body.data).toEqual([{ id: 1, year: 2026, semester: 1 }]);
  });

  it("resolves a single period by year and semester", async () => {
    getByYearSemesterMock.mockReturnValue({ id: 4, year: 2026, semester: 1 });

    const response = await GET({
      url: new URL("http://localhost/api/v1/periods?year=2026&semester=1"),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getByYearSemesterMock).toHaveBeenCalledWith(2026, 1);
    expect(body.data).toEqual({ id: 4, year: 2026, semester: 1 });
  });

  it("returns 404 when no period matches the year and semester", async () => {
    getByYearSemesterMock.mockReturnValue(undefined);

    const response = await GET({
      url: new URL("http://localhost/api/v1/periods?year=1999&semester=2"),
    } as any);

    expect(response.status).toBe(404);
  });
});