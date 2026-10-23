import { describe, it, expect, afterEach } from "vitest";

import { AttendanceStatus } from "$lib/common/types/attendance";

import { attendanceService } from "./attendance.service";
import { enrollmentRepository } from "../repositories/enrollment.repository";
import { personRepository } from "../repositories/person.repository";
import db from "../database/db";

// Seeded fixtures: cursada 1 (subject 1, period 2) holds commissions 1 and 2
// with enrollments 1..8 in total; assignment 1 and 2 belong to cursada 1.
// Cursada 2 (subject 2, period 3) holds enrollment 9 in commission 3.
const CURSADA_1 = 1;
const CURSADA_2 = 2;
const COMMISSION_1 = 1;
const COMMISSION_2 = 2;
const ASSIGNMENT_1 = 1;
const ASSIGNMENT_2 = 2;

describe("attendanceService", () => {
  const createdPersonIds: number[] = [];

  afterEach(() => {
    db.prepare("DELETE FROM attendances").run();
    for (const id of createdPersonIds) {
      db.prepare("DELETE FROM enrollments WHERE person_id = ?").run(id);
      db.prepare("DELETE FROM persons WHERE id = ?").run(id);
    }
    createdPersonIds.length = 0;
  });

  it("builds a commission grid with the roster, the assignments and empty cells", () => {
    const grid = attendanceService.getGridByCommission(COMMISSION_1);

    expect(grid).not.toBeNull();
    expect(grid?.scope).toBe("commission");
    expect(grid?.commission).toEqual({ id: 1, name: "Comisión Mañana", slug: "comision-manana" });
    expect(grid?.assignments.length).toBeGreaterThan(0);
    expect(grid?.rows).toHaveLength(4);
    expect(grid?.rows.every((row) => row.is_guest === false)).toBe(true);
    expect(grid?.rows[0]?.cells).toHaveLength(grid?.assignments.length ?? 0);
    expect(grid?.rows[0]?.cells.every((cell) => cell.status === null)).toBe(true);
    expect(grid?.columns.every((column) => column.taken_count === 0)).toBe(true);
  });

  it("records a decision and reflects it in the row and column summaries", () => {
    attendanceService.mark(ASSIGNMENT_1, 1, AttendanceStatus.PRESENT);
    attendanceService.mark(ASSIGNMENT_1, 2, AttendanceStatus.ABSENT);

    const grid = attendanceService.getGridByCommission(COMMISSION_1);
    const juan = grid?.rows.find((row) => row.enrollment_id === 1);
    const column = grid?.columns.find((item) => item.assignment_id === ASSIGNMENT_1);

    expect(juan?.present_count).toBe(1);
    expect(juan?.taken_count).toBe(1);
    expect(juan?.cells.find((cell) => cell.assignment_id === ASSIGNMENT_1)?.status).toBe(
      AttendanceStatus.PRESENT,
    );
    expect(column?.present_count).toBe(1);
    expect(column?.taken_count).toBe(2);
  });

  it("does not count an untaken assignment as an absence", () => {
    attendanceService.mark(ASSIGNMENT_1, 1, AttendanceStatus.PRESENT);

    const grid = attendanceService.getGridByCommission(COMMISSION_1);
    const juan = grid?.rows.find((row) => row.enrollment_id === 1);

    expect(juan?.taken_count).toBe(1);
    expect(juan?.present_count).toBe(1);
    expect(grid?.columns.find((item) => item.assignment_id === ASSIGNMENT_2)?.taken_count).toBe(0);
  });

  it("shows a guest in the commission where attendance was taken and in their own commission", () => {
    // Enrollment 5 belongs to commission 2; attendance is taken in commission 1.
    attendanceService.mark(ASSIGNMENT_1, 5, AttendanceStatus.PRESENT, COMMISSION_1);

    const taken = attendanceService.getGridByCommission(COMMISSION_1);
    const own = attendanceService.getGridByCommission(COMMISSION_2);

    const guestRow = taken?.rows.find((row) => row.enrollment_id === 5);
    expect(guestRow?.is_guest).toBe(true);
    expect(guestRow?.commission_name).toBe("Comisión Tarde");
    expect(
      guestRow?.cells.find((cell) => cell.assignment_id === ASSIGNMENT_1)?.status,
    ).toBe(AttendanceStatus.PRESENT);

    const ownRow = own?.rows.find((row) => row.enrollment_id === 5);
    expect(ownRow?.is_guest).toBe(false);
    expect(ownRow?.cells.find((cell) => cell.assignment_id === ASSIGNMENT_1)?.status).toBe(
      AttendanceStatus.PRESENT,
    );
  });

  it("builds the cursada grid with every enrollment and no guests", () => {
    attendanceService.mark(ASSIGNMENT_1, 5, AttendanceStatus.PRESENT, COMMISSION_1);

    const grid = attendanceService.getGridByCursada(CURSADA_1);

    expect(grid?.scope).toBe("cursada");
    expect(grid?.commission).toBeNull();
    expect(grid?.rows).toHaveLength(8);
    expect(grid?.rows.every((row) => row.is_guest === false)).toBe(true);
    expect(grid?.rows.find((row) => row.enrollment_id === 5)?.commission_name).toBe(
      "Comisión Tarde",
    );
  });

  it("includes enrollments without commission in the cursada grid", () => {
    const person = personRepository.create("Sin Comisión Grilla", "ATT-001");
    createdPersonIds.push(person.id);
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1);

    const grid = attendanceService.getGridByCursada(CURSADA_1);
    const row = grid?.rows.find((item) => item.enrollment_id === enrollment.id);

    expect(row).toBeDefined();
    expect(row?.commission_id).toBeNull();
    expect(row?.commission_name).toBeNull();
  });

  it("unmarks a decision and returns the cell to the not-taken state", () => {
    attendanceService.mark(ASSIGNMENT_1, 1, AttendanceStatus.ABSENT);
    attendanceService.unmark(ASSIGNMENT_1, 1);

    const grid = attendanceService.getGridByCommission(COMMISSION_1);
    const cell = grid?.rows
      .find((row) => row.enrollment_id === 1)
      ?.cells.find((item) => item.assignment_id === ASSIGNMENT_1);

    expect(cell?.status).toBeNull();
  });

  it("rejects marking an enrollment from another cursada", () => {
    expect(() => attendanceService.mark(ASSIGNMENT_1, 9, AttendanceStatus.PRESENT)).toThrow();

    const grid = attendanceService.getGridByCursada(CURSADA_2);
    expect(grid?.rows.every((row) => row.taken_count === 0)).toBe(true);
  });

  it("rejects an unknown assignment", () => {
    expect(() => attendanceService.mark(999999, 1, AttendanceStatus.PRESENT)).toThrow(
      /Assignment not found/,
    );
  });

  it("applies a bulk of decisions using the assignment cursada", () => {
    const records = attendanceService.bulk(ASSIGNMENT_1, COMMISSION_1, [
      { enrollment_id: 1, status: AttendanceStatus.PRESENT },
      { enrollment_id: 2, status: AttendanceStatus.PRESENT },
    ]);

    expect(records).toHaveLength(2);
    expect(records.every((record) => record.subject_period_id === CURSADA_1)).toBe(true);
    expect(records.every((record) => record.commission_id === COMMISSION_1)).toBe(true);
  });

  it("rejects a bulk that mixes another cursada", () => {
    expect(() =>
      attendanceService.bulk(ASSIGNMENT_1, COMMISSION_1, [
        { enrollment_id: 1, status: AttendanceStatus.PRESENT },
        { enrollment_id: 9, status: AttendanceStatus.PRESENT },
      ]),
    ).toThrow();

    expect(attendanceService.getGridByCursada(CURSADA_1)?.rows.every((row) => row.taken_count === 0)).toBe(
      true,
    );
  });

  it("drops a deleted person from both grids", () => {
    const person = personRepository.create("Se Va De La Grilla", "ATT-002");
    createdPersonIds.push(person.id);
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1, COMMISSION_1);
    attendanceService.mark(ASSIGNMENT_1, enrollment.id, AttendanceStatus.PRESENT);

    expect(
      attendanceService
        .getGridByCommission(COMMISSION_1)
        ?.rows.some((row) => row.enrollment_id === enrollment.id),
    ).toBe(true);

    personRepository.delete(person.id);

    expect(
      attendanceService
        .getGridByCommission(COMMISSION_1)
        ?.rows.some((row) => row.enrollment_id === enrollment.id),
    ).toBe(false);
    expect(
      attendanceService
        .getGridByCursada(CURSADA_1)
        ?.rows.some((row) => row.enrollment_id === enrollment.id),
    ).toBe(false);
  });
});
