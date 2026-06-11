import { describe, it, expect, vi } from "vitest";
import { commissionService } from "./commission.service";
import { apiFetch } from "../api";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("commissionService", () => {
  it("getAll calls apiFetch", async () => {
    await commissionService.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/commissions");
  });

  it("create calls apiFetch", async () => {
    await commissionService.create(1, "Comm A");
    expect(apiFetch).toHaveBeenCalledWith(
      "/commissions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ period_id: 1, name: "Comm A" }),
      }),
    );
  });
});
