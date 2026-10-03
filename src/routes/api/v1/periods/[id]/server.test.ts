import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./+server";

const { getByIdMock, updateMock, deleteMock } = vi.hoisted(() => ({
  getByIdMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("$lib/server/services/period.service", async () => {
  return {
    periodService: {
      getById: getByIdMock,
      update: updateMock,
      delete: deleteMock,
    },
  };
});

describe("period API", () => {
  beforeEach(() => {
    getByIdMock.mockReset();
    updateMock.mockReset();
    deleteMock.mockReset();
  });

  it("returns the period for a valid id", async () => {
    getByIdMock.mockReturnValue({ id: 7, year: 2026, semester: 2 });

    const response = await GET({ params: { id: "7" } } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getByIdMock).toHaveBeenCalledWith(7);
    expect(body.data).toEqual({ id: 7, year: 2026, semester: 2 });
  });

  it("returns 404 when the period does not exist", async () => {
    getByIdMock.mockReturnValue(undefined);

    const response = await GET({ params: { id: "9999" } } as any);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Period not found");
  });
});