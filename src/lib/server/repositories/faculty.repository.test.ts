import { describe, it, expect, afterEach } from "vitest";
import { facultyRepository } from "./faculty.repository";
import db from "../db";

describe("facultyRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM faculties WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates and retrieves a faculty", () => {
    const faculty = facultyRepository.create("Test Faculty X");
    createdIds.push(faculty.id);

    expect(faculty.id).toBeGreaterThan(0);
    expect(faculty.name).toBe("Test Faculty X");

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found).toBeTruthy();
    expect(found?.name).toBe("Test Faculty X");
  });

  it("updates a faculty name", () => {
    const faculty = facultyRepository.create("Old Name Faculty");
    createdIds.push(faculty.id);

    const updated = facultyRepository.update(faculty.id, "New Name Faculty");
    expect(updated.name).toBe("New Name Faculty");

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found?.name).toBe("New Name Faculty");
  });

  it("soft-deletes a faculty", () => {
    const faculty = facultyRepository.create("Delete Target Faculty");
    createdIds.push(faculty.id);

    facultyRepository.delete(faculty.id);

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found).toBeUndefined(); // Soft-deleted faculties are excluded from getAll
  });
});
