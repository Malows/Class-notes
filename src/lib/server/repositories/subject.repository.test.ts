import { describe, it, expect, afterEach } from "vitest";
import { subjectRepository } from "./subject.repository";
import db from "../database/db";

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
    expect(subject.slug).toBe("discrete-mathematics");
    expect(subject.faculty_name).toBe("Facultad de Ingeniería");
    expect(subject.faculty_slug).toBe("facultad-de-ingenieria");

    const list = subjectRepository.getAll();
    const found = list.find((s) => s.id === subject.id);
    expect(found).toBeTruthy();

    const updated = subjectRepository.update(subject.id, "Discrete Maths V2");
    expect(updated.name).toBe("Discrete Maths V2");
    expect(updated.slug).toBe("discrete-maths-v2");
  });

  it("appends a numeric suffix for a slug collision within the faculty", () => {
    const first = subjectRepository.create(1, "Materia Colision");
    const second = subjectRepository.create(1, "Materia Colision");
    createdIds.push(first.id, second.id);

    expect(first.slug).toBe("materia-colision");
    expect(second.slug).toBe("materia-colision-2");
  });

  it("allows the same slug in a different faculty", () => {
    const first = subjectRepository.create(1, "Materia Compartida");
    const second = subjectRepository.create(2, "Materia Compartida");
    createdIds.push(first.id, second.id);

    expect(first.slug).toBe("materia-compartida");
    expect(second.slug).toBe("materia-compartida");
  });

  it("updates and soft-deletes a subject", () => {
    const subject = subjectRepository.create(1, "Calculus 5");
    createdIds.push(subject.id);

    const updated = subjectRepository.update(subject.id, "Calculus 6");
    expect(updated.name).toBe("Calculus 6");
    expect(updated.faculty_name).toBe("Facultad de Ingeniería");

    subjectRepository.delete(subject.id);

    const list = subjectRepository.getAll();
    const found = list.find((s) => s.id === subject.id);
    expect(found).toBeUndefined();
  });
});
