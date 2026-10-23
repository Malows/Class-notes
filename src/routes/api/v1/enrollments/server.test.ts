import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./+server";

const { getRosterMock, getPendingMock, getByCursadaMock, registerMock } = vi.hoisted(() => ({
  getRosterMock: vi.fn(),
  getPendingMock: vi.fn(),
  getByCursadaMock: vi.fn(),
  registerMock: vi.fn(),
}));

vi.mock("$lib/server/services/enrollment.service", async () => {
  return {
    enrollmentService: {
      getRoster: getRosterMock,
      getPending: getPendingMock,
      getByCursada: getByCursadaMock,
      register: registerMock,
    },
  };
});

describe("enrollments collection API", () => {
  beforeEach(() => {
    getRosterMock.mockReset();
    getPendingMock.mockReset();
    getByCursadaMock.mockReset();
    registerMock.mockReset();
  });

  it("rejects a request without commission_id or subject_period_id", async () => {
    const response = await GET({ url: new URL("http://localhost/api/v1/enrollments") } as any);

    expect(response.status).toBe(400);
    expect(getRosterMock).not.toHaveBeenCalled();
  });

  it("returns the roster of a commission", async () => {
    getRosterMock.mockReturnValue([{ id: 1, person_id: 1, name: "Ana", legajo: null }]);

    const response = await GET({
      url: new URL("http://localhost/api/v1/enrollments?commission_id=1"),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getRosterMock).toHaveBeenCalledWith(1);
    expect(body.data).toHaveLength(1);
  });

  it("returns the pending enrollments of a cursada", async () => {
    getPendingMock.mockReturnValue([]);

    const response = await GET({
      url: new URL("http://localhost/api/v1/enrollments?subject_period_id=1&pending=true"),
    } as any);

    expect(response.status).toBe(200);
    expect(getPendingMock).toHaveBeenCalledWith(1);
    expect(getByCursadaMock).not.toHaveBeenCalled();
  });

  it("rejects a registration without entries", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/v1/enrollments", {
        method: "POST",
        body: JSON.stringify({ subject_period_id: 1, entries: [] }),
      }),
    } as any);

    expect(response.status).toBe(400);
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("rejects a registration without subject_period_id", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/v1/enrollments", {
        method: "POST",
        body: JSON.stringify({ entries: [{ name: "Ana" }] }),
      }),
    } as any);

    expect(response.status).toBe(400);
  });

  it("returns the created-vs-reused report", async () => {
    registerMock.mockReturnValue({ created: 2, reused: 1, enrollments: [] });

    const response = await POST({
      request: new Request("http://localhost/api/v1/enrollments", {
        method: "POST",
        body: JSON.stringify({
          subject_period_id: 1,
          commission_id: 1,
          entries: [{ name: "Ana" }, { name: "Beto" }, { name: "Caro" }],
        }),
      }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data).toEqual({ created: 2, reused: 1, enrollments: [] });
    expect(registerMock).toHaveBeenCalledWith(1, [{ name: "Ana" }, { name: "Beto" }, { name: "Caro" }], 1);
  });

  it("maps a legajo conflict to 409", async () => {
    const { LegajoConflictError } = await import("$lib/server/repositories/person.repository");
    registerMock.mockImplementation(() => {
      throw new LegajoConflictError("ING-001");
    });

    const response = await POST({
      request: new Request("http://localhost/api/v1/enrollments", {
        method: "POST",
        body: JSON.stringify({ subject_period_id: 1, entries: [{ name: "Ana", legajo: "ING-001" }] }),
      }),
    } as any);

    expect(response.status).toBe(409);
  });
});
