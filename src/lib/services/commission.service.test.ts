import { describe, it, expect, vi } from "vitest";

import { apiFetch } from "../api";
import { commissionService } from "./commission.service";

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

  it("update calls apiFetch with PUT", async () => {
    await commissionService.update(1, "New Name");
    expect(apiFetch).toHaveBeenCalledWith(
      "/commissions/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "New Name" }),
      }),
    );
  });

  it("delete calls apiFetch with DELETE", async () => {
    await commissionService.delete(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/commissions/1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
