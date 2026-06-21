import { describe, it, expect, vi } from "vitest";

import { apiFetch } from "../api";
import { assignmentService } from "./assignment.service";

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

  it("update calls apiFetch with PUT", async () => {
    await assignmentService.update(1, "New Title", "New Subtitle");
    expect(apiFetch).toHaveBeenCalledWith(
      "/assignments/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ title: "New Title", subtitle: "New Subtitle" }),
      }),
    );
  });

  it("updateStatus calls apiFetch with PUT status", async () => {
    await assignmentService.updateStatus(1, "WAITING_FOR_STUDENTS");
    expect(apiFetch).toHaveBeenCalledWith(
      "/assignments/1/status",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ status: "WAITING_FOR_STUDENTS" }),
      }),
    );
  });

  it("copy calls apiFetch with POST copy", async () => {
    await assignmentService.copy(1, 2);
    expect(apiFetch).toHaveBeenCalledWith(
      "/assignments/copy",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ source_period_id: 1, target_period_id: 2 }),
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
