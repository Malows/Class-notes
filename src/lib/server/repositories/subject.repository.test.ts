import { describe, it, expect, afterEach } from "vitest";
import { subjectRepository } from "./subject.repository";
import db from "../db";

describe("subjectRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM subjects WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates, retrieves, and updates a subject under a faculty", () => {
    // Uses faculty_id = 1 (seeded 'Facultad de Ingeniería')
    const subject = subjectRepository.create(1, "Discrete Mathematics");
    createdIds.push(subject.id);

    expect(subject.id).toBeGreaterThan(0);
    expect(subject.name).toBe("Discrete Mathematics");
    expect(subject.faculty_name).toBe("Facultad de Ingeniería");

    const list = subjectRepository.getAll(1);
    const found = list.find((s) => s.id === subject.id);
    expect(found).toBeTruthy();

    const updated = subjectRepository.update(subject.id, "Discrete Maths V2");
    expect(updated.name).toBe("Discrete Maths V2");
  });

  it("soft-deletes a subject", () => {
    const subject = subjectRepository.create(1, "Calculus 5");
    createdIds.push(subject.id);

    subjectRepository.delete(subject.id);

    const list = subjectRepository.getAll(1);
    const found = list.find((s) => s.id === subject.id);
    expect(found).toBeUndefined();
  });
});
