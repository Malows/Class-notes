import { describe, it, expect, vi } from "vitest";
import { assignmentService } from "./assignment.service";
import { apiFetch } from "../api";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("assignmentService", () => {
  it("getAll calls apiFetch", async () => {
    await assignmentService.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/assignments");
  });

  it("create calls apiFetch", async () => {
    await assignmentService.create(1, "Title");
    expect(apiFetch).toHaveBeenCalledWith(
      "/assignments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ period_id: 1, title: "Title" }),
      }),
    );
  });

  it("delete calls apiFetch with DELETE", async () => {
    await assignmentService.delete(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/assignments/1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
