import { beforeEach, describe, expect, it, vi } from "vitest";

import { periodService } from "./period.service";

const { getAllMock, getAllBySubjectMock, createMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  getAllBySubjectMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("../repositories/period.repository", () => ({
  periodRepository: {
    getAll: getAllMock,
    getAllBySubject: getAllBySubjectMock,
    create: createMock,
  },
}));

describe("periodService", () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getAllBySubjectMock.mockReset();
    createMock.mockReset();
  });

  it("delegates listing and creation to the period repository", async () => {
    getAllMock.mockReturnValue([{ id: 1, year: 2026, semester: 1 }]);
    getAllBySubjectMock.mockReturnValue([{ id: 2, year: 2026, semester: 2, subject_id: 7 }]);
    createMock.mockReturnValue({ id: 3, year: 2027, semester: 2 });

    const periods = periodService.getAll(7);
    const created = periodService.create(7, 2027, 2);

    expect(getAllBySubjectMock).toHaveBeenCalledWith(7);
    expect(createMock).toHaveBeenCalledWith(7, 2027, 2);
    expect(periods).toEqual([{ id: 2, year: 2026, semester: 2, subject_id: 7 }]);
    expect(created).toEqual({ id: 3, year: 2027, semester: 2 });
  });
});
