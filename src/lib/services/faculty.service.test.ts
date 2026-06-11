import { describe, it, expect, vi } from "vitest";
import { facultyService } from "./faculty.service";
import { apiFetch } from "../api";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("facultyService", () => {
  it("getAll calls apiFetch with correct path", async () => {
    await facultyService.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/faculties");
  });

  it("create calls apiFetch with correct payload", async () => {
    await facultyService.create("Test Faculty");
    expect(apiFetch).toHaveBeenCalledWith(
      "/faculties",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Test Faculty" }),
      }),
    );
  });

  it("update calls apiFetch with correct payload", async () => {
    await facultyService.update(1, "Updated Faculty");
    expect(apiFetch).toHaveBeenCalledWith(
      "/faculties/1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ name: "Updated Faculty" }),
      }),
    );
  });

  it("delete calls apiFetch with correct path", async () => {
    await facultyService.delete(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/faculties/1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
