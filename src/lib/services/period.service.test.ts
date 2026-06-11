import { describe, it, expect, vi } from "vitest";
import { periodService } from "./period.service";
import { apiFetch } from "../api";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("periodService", () => {
  it("getAll calls apiFetch", async () => {
    await periodService.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/periods");
  });

  it("create calls apiFetch", async () => {
    await periodService.create(1, 2026, 1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/periods",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ subject_id: 1, year: 2026, semester: 1 }),
      }),
    );
  });
});
