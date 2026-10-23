import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, PATCH } from "./+server";

const { assignCommissionMock, removeMock } = vi.hoisted(() => ({
  assignCommissionMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("$lib/server/services/enrollment.service", async () => {
  return {
    enrollmentService: {
      assignCommission: assignCommissionMock,
      remove: removeMock,
    },
  };
});

describe("enrollment item API", () => {
  beforeEach(() => {
    assignCommissionMock.mockReset();
    removeMock.mockReset();
  });

  it("rejects a patch without commission_id", async () => {
    const response = await PATCH({
      params: { id: "1" },
      request: new Request("http://localhost/api/v1/enrollments/1", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    } as any);

    expect(response.status).toBe(400);
    expect(assignCommissionMock).not.toHaveBeenCalled();
  });

  it("assigns and unassigns a commission", async () => {
    assignCommissionMock.mockReturnValue({ id: 1, commission_id: 2 });

    const response = await PATCH({
      params: { id: "1" },
      request: new Request("http://localhost/api/v1/enrollments/1", {
        method: "PATCH",
        body: JSON.stringify({ commission_id: 2 }),
      }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(assignCommissionMock).toHaveBeenCalledWith(1, 2);
    expect(body.data.commission_id).toBe(2);

    await PATCH({
      params: { id: "1" },
      request: new Request("http://localhost/api/v1/enrollments/1", {
        method: "PATCH",
        body: JSON.stringify({ commission_id: null }),
      }),
    } as any);
    expect(assignCommissionMock).toHaveBeenLastCalledWith(1, null);
  });

  it("maps a cross-cursada assignment to 409", async () => {
    const { CrossCursadaError } = await import(
      "$lib/server/repositories/enrollment.repository"
    );
    assignCommissionMock.mockImplementation(() => {
      throw new CrossCursadaError();
    });

    const response = await PATCH({
      params: { id: "1" },
      request: new Request("http://localhost/api/v1/enrollments/1", {
        method: "PATCH",
        body: JSON.stringify({ commission_id: 3 }),
      }),
    } as any);

    expect(response.status).toBe(409);
  });

  it("maps a missing enrollment to 404", async () => {
    assignCommissionMock.mockImplementation(() => {
      throw new Error("Enrollment not found");
    });

    const response = await PATCH({
      params: { id: "999" },
      request: new Request("http://localhost/api/v1/enrollments/999", {
        method: "PATCH",
        body: JSON.stringify({ commission_id: 1 }),
      }),
    } as any);

    expect(response.status).toBe(404);
  });

  it("deletes an enrollment", async () => {
    const response = await DELETE({ params: { id: "1" } } as any);

    expect(response.status).toBe(204);
    expect(removeMock).toHaveBeenCalledWith(1);
  });
});
