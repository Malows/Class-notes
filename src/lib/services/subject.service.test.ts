import { describe, it, expect, vi } from "vitest";

import { apiFetch } from "../api";
import { subjectService } from "./subject.service";

vi.mock("../api", () => ({
  apiFetch: vi.fn(),
}));

describe("subjectService", () => {
  it("getAll calls apiFetch", async () => {
    await subjectService.getAll();
    expect(apiFetch).toHaveBeenCalledWith("/subjects");
  });

  it("create calls apiFetch with payload", async () => {
    await subjectService.create(1, "Subject");
    expect(apiFetch).toHaveBeenCalledWith(
      "/subjects",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ faculty_id: 1, name: "Subject" }),
      }),
    );
  });
});
