import { describe, it, expect, afterEach } from "vitest";
import { facultyRepository } from "./faculty.repository";
import db from "../database/db";

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
    expect(faculty.slug).toBe("test-faculty-x");

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found).toBeTruthy();
    expect(found?.name).toBe("Test Faculty X");
    expect(found?.slug).toBe("test-faculty-x");
  });

  it("regenerates the slug when the name changes", () => {
    const faculty = facultyRepository.create("Old Name Faculty");
    createdIds.push(faculty.id);

    const updated = facultyRepository.update(faculty.id, "New Name Faculty");
    expect(updated.slug).toBe("new-name-faculty");
  });

  it("keeps its slug when saved with the same name", () => {
    const faculty = facultyRepository.create("Self Faculty");
    createdIds.push(faculty.id);

    const updated = facultyRepository.update(faculty.id, "Self Faculty");
    expect(updated.slug).toBe("self-faculty");
  });

  it("appends a numeric suffix when the slug is taken", () => {
    const first = facultyRepository.create("Colliding Faculty");
    const second = facultyRepository.create("Colliding Faculty");
    createdIds.push(first.id, second.id);

    expect(first.slug).toBe("colliding-faculty");
    expect(second.slug).toBe("colliding-faculty-2");
  });

  it("reuses the slug of a soft-deleted faculty", () => {
    const first = facultyRepository.create("Reusable Faculty");
    createdIds.push(first.id);
    facultyRepository.delete(first.id);

    const second = facultyRepository.create("Reusable Faculty");
    createdIds.push(second.id);

    expect(second.slug).toBe("reusable-faculty");
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
