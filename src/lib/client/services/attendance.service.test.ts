import { describe, it, expect, vi, beforeEach } from "vitest";

import { AttendanceStatus } from "$lib/common/types/attendance";

import { attendanceService } from "./attendance.service";
import { apiFetch } from "$lib/client/services/api";

vi.mock("$lib/client/services/api", () => ({ apiFetch: vi.fn() }));

describe("attendanceService (client)", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue(undefined);
  });

  it("builds the commission grid URL", async () => {
    await attendanceService.getGridByCommission(3);

    expect(apiFetch).toHaveBeenCalledWith("/attendance?commission_id=3");
  });

  it("builds the cursada grid URL", async () => {
    await attendanceService.getGridByCursada(7);

    expect(apiFetch).toHaveBeenCalledWith("/attendance?subject_period_id=7");
  });

  it("records a decision", async () => {
    await attendanceService.mark(1, 5, AttendanceStatus.PRESENT);

    expect(apiFetch).toHaveBeenCalledWith("/attendance/1/5", {
      method: "PUT",
      body: JSON.stringify({ status: "PRESENT" }),
    });
  });

  it("unmarks a decision", async () => {
    await attendanceService.unmark(1, 5);

    expect(apiFetch).toHaveBeenCalledWith("/attendance/1/5", { method: "DELETE" });
  });

  it("sends a bulk of decisions", async () => {
    await attendanceService.bulk(1, [{ enrollment_id: 5, status: AttendanceStatus.PRESENT }]);

    expect(apiFetch).toHaveBeenCalledWith("/attendance/bulk", {
      method: "POST",
      body: JSON.stringify({
        assignment_id: 1,
        entries: [{ enrollment_id: 5, status: "PRESENT" }],
      }),
    });
  });
});
