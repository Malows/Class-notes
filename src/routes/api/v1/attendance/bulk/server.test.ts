import { beforeEach, describe, expect, it, vi } from "vitest";

import { CrossCursadaError } from "$lib/server/repositories/enrollment.repository";

import { POST } from "./+server";

const { bulkMock } = vi.hoisted(() => ({ bulkMock: vi.fn() }));

vi.mock("$lib/server/services/attendance.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/server/services/attendance.service")>();
  return {
    ...actual,
    attendanceService: { bulk: bulkMock },
  };
});

const postRequest = (payload: unknown) =>
  new Request("http://localhost/api/v1/attendance/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });

describe("attendance bulk API", () => {
  beforeEach(() => {
    bulkMock.mockReset();
  });

  it("rejects a body without assignment_id", async () => {
    const response = await POST({
      request: postRequest({ entries: [{ enrollment_id: 1, status: "PRESENT" }] }),
    } as any);

    expect(response.status).toBe(400);
    expect(bulkMock).not.toHaveBeenCalled();
  });

  it("rejects an empty entries list", async () => {
    const response = await POST({ request: postRequest({ assignment_id: 1, entries: [] }) } as any);

    expect(response.status).toBe(400);
  });

  it("rejects an entry with an invalid status", async () => {
    const response = await POST({
      request: postRequest({ assignment_id: 1, entries: [{ enrollment_id: 1, status: "NOPE" }] }),
    } as any);

    expect(response.status).toBe(400);
  });

  it("applies the bulk and returns 201", async () => {
    bulkMock.mockReturnValue([{ assignment_id: 1, enrollment_id: 1 }]);

    const response = await POST({
      request: postRequest({
        assignment_id: 1,
        entries: [
          { enrollment_id: 1, status: "PRESENT" },
          { enrollment_id: 2, status: "ABSENT" },
        ],
      }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(bulkMock).toHaveBeenCalledWith(1, [
      { enrollment_id: 1, status: "PRESENT" },
      { enrollment_id: 2, status: "ABSENT" },
    ]);
    expect(body.data).toHaveLength(1);
  });

  it("maps a missing assignment to 404", async () => {
    const { AttendanceTargetNotFoundError } = await import(
      "$lib/server/services/attendance.service"
    );
    bulkMock.mockImplementation(() => {
      throw new AttendanceTargetNotFoundError("Assignment");
    });

    const response = await POST({
      request: postRequest({ assignment_id: 999, entries: [{ enrollment_id: 1, status: "PRESENT" }] }),
    } as any);

    expect(response.status).toBe(404);
  });

  it("maps a cross-cursada entry to 409", async () => {
    bulkMock.mockImplementation(() => {
      throw new CrossCursadaError();
    });

    const response = await POST({
      request: postRequest({ assignment_id: 1, entries: [{ enrollment_id: 9, status: "PRESENT" }] }),
    } as any);

    expect(response.status).toBe(409);
  });
});
