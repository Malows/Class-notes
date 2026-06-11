import { describe, it, expect, vi } from "vitest";
import { studentService } from "./student.service";
import { apiFetch } from "../api";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("studentService", () => {
  it("getAll calls apiFetch", async () => {
    await studentService.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/students");
  });

  it("create calls apiFetch", async () => {
    await studentService.create(1, ["S1"]);
    expect(apiFetch).toHaveBeenCalledWith(
      "/students",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ commission_id: 1, names: ["S1"] }),
      }),
    );
  });

  it("delete calls apiFetch with DELETE", async () => {
    await studentService.delete(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/students/1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
