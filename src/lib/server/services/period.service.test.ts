import { beforeEach, describe, expect, it, vi } from "vitest";

import { periodService } from "./period.service";

const { getAllMock, createMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("../repositories/period.repository", () => ({
  periodRepository: {
    getAll: getAllMock,
    create: createMock,
  },
}));

describe("periodService", () => {
  beforeEach(() => {
    getAllMock.mockReset();
    createMock.mockReset();
  });

  it("delegates listing and creation to the period repository", async () => {
    getAllMock.mockReturnValue([{ id: 1, year: 2026, semester: 1 }]);
    createMock.mockReturnValue({ id: 2, year: 2027, semester: 2 });

    const periods = periodService.getAll(7);
    const created = periodService.create(7, 2027, 2);

    expect(getAllMock).toHaveBeenCalledWith(7);
    expect(createMock).toHaveBeenCalledWith(7, 2027, 2);
    expect(periods).toEqual([{ id: 1, year: 2026, semester: 1 }]);
    expect(created).toEqual({ id: 2, year: 2027, semester: 2 });
  });
});
