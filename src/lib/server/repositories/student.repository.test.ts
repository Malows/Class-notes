import { describe, it, expect, afterEach } from "vitest";
import { studentRepository } from "./student.repository";
import db from "../db";

describe("studentRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates and retrieves a single student via createBulk", () => {
    // Single creation is achieved via createBulk with a single name
    studentRepository.createBulk(1, ["John Doe"]);

    const list = studentRepository.getAll(1);
    const student = list.find((s) => s.name === "John Doe");
    expect(student).toBeTruthy();
    if (student) {
      createdIds.push(student.id);
      expect(student.name).toBe("John Doe");
    }
  });

  it("creates bulk students", () => {
    const initialCount = studentRepository.getAll(1).length;
    studentRepository.createBulk(1, ["Alice Smith", "Bob Jones"]);

    const updatedList = studentRepository.getAll(1);
    expect(updatedList.length).toBe(initialCount + 2);

    const created = updatedList.filter((s) => s.name === "Alice Smith" || s.name === "Bob Jones");
    for (const s of created) {
      createdIds.push(s.id);
    }
    expect(created).toHaveLength(2);
  });

  it("updates and soft-deletes a student", () => {
    studentRepository.createBulk(1, ["Temporary Student"]);
    const listBefore = studentRepository.getAll(1);
    const student = listBefore.find((s) => s.name === "Temporary Student");
    expect(student).toBeTruthy();

    if (student) {
      createdIds.push(student.id);

      const updated = studentRepository.update(student.id, "Updated Student Name");
      expect(updated.name).toBe("Updated Student Name");

      studentRepository.delete(student.id);
      const listAfter = studentRepository.getAll(1);
      expect(listAfter.some((s) => s.id === student.id)).toBe(false);
    }
  });
});
