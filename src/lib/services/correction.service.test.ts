import { describe, it, expect, vi } from "vitest";

import { apiFetch } from "../api";
import { DeliveryWorkflowStatus } from "../types";
import { correctionService } from "./correction.service";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("correctionService", () => {
  it("get calls apiFetch", async () => {
    await correctionService.get(1);
    expect(apiFetch).toHaveBeenCalledWith("/correct?commission_id=1");
  });

  it("getOne calls apiFetch", async () => {
    await correctionService.getOne(1, 2);
    expect(apiFetch).toHaveBeenCalledWith("/correct?assignment_id=1&student_id=2");
  });

  it("save calls apiFetch", async () => {
    const delivery = {
      assignment_id: 1,
      student_id: 1,
      grade: 10,
      ai_level: 0,
      comments: "OK",
      workflow_status: DeliveryWorkflowStatus.APPROVED,
    };
    await correctionService.save(delivery);
    expect(apiFetch).toHaveBeenCalledWith(
      "/correct",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(delivery),
      }),
    );
  });
});
