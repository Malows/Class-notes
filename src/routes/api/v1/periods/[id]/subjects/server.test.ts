import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, PUT } from "./+server";

const { getAllMock, syncMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  syncMock: vi.fn(),
}));

vi.mock("$lib/server/services/period-subject.service", async () => {
  return {
    periodSubjectService: {
      getAll: getAllMock,
      sync: syncMock,
    },
  };
});

describe("period subjects API", () => {
  beforeEach(() => {
    getAllMock.mockReset();
    syncMock.mockReset();
  });
  it("returns the subjects for a period", async () => {
    getAllMock.mockReturnValue([{ id: 1, name: "Álgebra Lineal" }]);

    const response = await GET({ params: { id: "7" } } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([{ id: 1, name: "Álgebra Lineal" }]);
  });

  it("syncs the association for a period", async () => {
    syncMock.mockReturnValue([{ id: 2, name: "Análisis Matemático I" }]);

    const response = await PUT({
      params: { id: "7" },
      request: new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({ subject_ids: [2] }),
        headers: { "Content-Type": "application/json" },
      }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(syncMock).toHaveBeenCalledWith(7, [2]);
    expect(body.data).toEqual([{ id: 2, name: "Análisis Matemático I" }]);
  });
});
