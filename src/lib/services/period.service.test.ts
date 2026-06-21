import { describe, it, expect, vi } from "vitest";

import { apiFetch } from "../api";
import { periodService } from "./period.service";

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

  it("update calls apiFetch with PUT", async () => {
    await periodService.update(1, 2027, 2);
    expect(apiFetch).toHaveBeenCalledWith(
      "/periods/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ year: 2027, semester: 2 }),
      }),
    );
  });

  it("delete calls apiFetch with DELETE", async () => {
    await periodService.delete(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/periods/1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
