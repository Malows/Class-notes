import { beforeEach, describe, expect, it, vi } from "vitest";

import { AttendanceStatus } from "$lib/common/types/attendance";
import { CrossCursadaError } from "$lib/server/repositories/enrollment.repository";

import { DELETE, GET, PUT } from "./+server";

const { getOneMock, markMock, unmarkMock } = vi.hoisted(() => ({
  getOneMock: vi.fn(),
  markMock: vi.fn(),
  unmarkMock: vi.fn(),
}));

vi.mock("$lib/server/services/attendance.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/server/services/attendance.service")>();
  return {
    ...actual,
    attendanceService: {
      getOne: getOneMock,
      mark: markMock,
      unmark: unmarkMock,
    },
  };
});

const record = {
  assignment_id: 1,
  enrollment_id: 1,
  subject_period_id: 1,
  commission_id: 1,
  status: AttendanceStatus.PRESENT,
  recorded_on: "2026-10-23",
};

const putRequest = (payload: unknown) =>
  new Request("http://localhost/api/v1/attendance/1/1", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

describe("attendance item API", () => {
  beforeEach(() => {
    getOneMock.mockReset();
    markMock.mockReset();
    unmarkMock.mockReset();
  });

  it("returns the record or null", async () => {
    getOneMock.mockReturnValue(null);

    const response = await GET({ params: { assignmentId: "1", enrollmentId: "1" } } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getOneMock).toHaveBeenCalledWith(1, 1);
    expect(body.data).toBeNull();
  });

  it("rejects non-numeric ids", async () => {
    const response = await PUT({
      params: { assignmentId: "abc", enrollmentId: "1" },
      request: putRequest({ status: "PRESENT" }),
    } as any);

    expect(response.status).toBe(400);
    expect(markMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid status", async () => {
    const response = await PUT({
      params: { assignmentId: "1", enrollmentId: "1" },
      request: putRequest({ status: "MAYBE" }),
    } as any);

    expect(response.status).toBe(400);
    expect(markMock).not.toHaveBeenCalled();
  });

  it("stores a decision", async () => {
    markMock.mockReturnValue(record);

    const response = await PUT({
      params: { assignmentId: "1", enrollmentId: "1" },
      request: putRequest({ status: "PRESENT", commission_id: 2 }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(markMock).toHaveBeenCalledWith(1, 1, "PRESENT", 2);
    expect(body.data).toEqual(record);
  });

  it("maps a missing target to 404", async () => {
    const { AttendanceTargetNotFoundError } = await import(
      "$lib/server/services/attendance.service"
    );
    markMock.mockImplementation(() => {
      throw new AttendanceTargetNotFoundError("Assignment");
    });

    const response = await PUT({
      params: { assignmentId: "999", enrollmentId: "1" },
      request: putRequest({ status: "PRESENT" }),
    } as any);

    expect(response.status).toBe(404);
  });

  it("maps a cross-cursada enrollment to 409", async () => {
    markMock.mockImplementation(() => {
      throw new CrossCursadaError();
    });

    const response = await PUT({
      params: { assignmentId: "1", enrollmentId: "9" },
      request: putRequest({ status: "PRESENT" }),
    } as any);

    expect(response.status).toBe(409);
  });

  it("unmarks and returns 204", async () => {
    const response = await DELETE({ params: { assignmentId: "1", enrollmentId: "1" } } as any);

    expect(response.status).toBe(204);
    expect(unmarkMock).toHaveBeenCalledWith(1, 1);
  });
});
