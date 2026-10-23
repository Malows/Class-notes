import { describe, it, expect, afterEach } from "vitest";

import { AttendanceStatus } from "$lib/common/types/attendance";

import { attendanceRepository } from "./attendance.repository";
import db from "../database/db";

// Seeded fixtures: assignment 1 belongs to cursada 1 (subject 1, period 2),
// enrollment 1 belongs to cursada 1 and commission 1, enrollment 9 belongs to
// cursada 2 (subject 2, period 3).
const ASSIGNMENT_1 = 1;
const ASSIGNMENT_2 = 2;
const ENROLLMENT_1 = 1;
const ENROLLMENT_2 = 2;
const ENROLLMENT_OTHER_CURSADA = 9;
const CURSADA_1 = 1;
const COMMISSION_1 = 1;
const COMMISSION_2 = 2;

const base = {
  assignmentId: ASSIGNMENT_1,
  enrollmentId: ENROLLMENT_1,
  subjectPeriodId: CURSADA_1,
  commissionId: COMMISSION_1,
  recordedOn: "2026-10-23",
};

describe("attendanceRepository Integration Tests", () => {
  afterEach(() => {
    db.prepare("DELETE FROM attendances").run();
  });

  it("stores a record with its status, date and commission", () => {
    const record = attendanceRepository.upsert({
      ...base,
      status: AttendanceStatus.PRESENT,
    });

    expect(record).toEqual({
      assignment_id: ASSIGNMENT_1,
      enrollment_id: ENROLLMENT_1,
      subject_period_id: CURSADA_1,
      commission_id: COMMISSION_1,
      status: AttendanceStatus.PRESENT,
      recorded_on: "2026-10-23",
    });
    expect(attendanceRepository.getOne(ASSIGNMENT_1, ENROLLMENT_1)).toEqual(record);
  });

  it("overwrites the existing record instead of duplicating it and moves the date", () => {
    attendanceRepository.upsert({ ...base, status: AttendanceStatus.PRESENT });

    const updated = attendanceRepository.upsert({
      ...base,
      status: AttendanceStatus.ABSENT,
      recordedOn: "2026-10-30",
    });

    const count = db
      .prepare("SELECT COUNT(*) AS c FROM attendances WHERE assignment_id = ? AND enrollment_id = ?")
      .get(ASSIGNMENT_1, ENROLLMENT_1) as { c: number };

    expect(count.c).toBe(1);
    expect(updated.status).toBe(AttendanceStatus.ABSENT);
    expect(updated.recorded_on).toBe("2026-10-30");
  });

  it("unmark removes the value and a later record revives the row", () => {
    attendanceRepository.upsert({ ...base, status: AttendanceStatus.PRESENT });

    attendanceRepository.unmark(ASSIGNMENT_1, ENROLLMENT_1);
    expect(attendanceRepository.getOne(ASSIGNMENT_1, ENROLLMENT_1)).toBeNull();
    expect(attendanceRepository.getByCursada(CURSADA_1)).toHaveLength(0);

    const revived = attendanceRepository.upsert({ ...base, status: AttendanceStatus.ABSENT });

    expect(revived.status).toBe(AttendanceStatus.ABSENT);
    const total = db.prepare("SELECT COUNT(*) AS c FROM attendances").get() as { c: number };
    expect(total.c).toBe(1);
  });

  it("returns every active record of the cursada and excludes unmarked ones", () => {
    attendanceRepository.bulkUpsert([
      { ...base, status: AttendanceStatus.PRESENT },
      { ...base, enrollmentId: ENROLLMENT_2, status: AttendanceStatus.ABSENT },
      { ...base, assignmentId: ASSIGNMENT_2, status: AttendanceStatus.PRESENT },
    ]);

    expect(attendanceRepository.getByCursada(CURSADA_1)).toHaveLength(3);

    attendanceRepository.unmark(ASSIGNMENT_2, ENROLLMENT_1);

    expect(attendanceRepository.getByCursada(CURSADA_1)).toHaveLength(2);
  });

  it("records a guest against the commission where it was taken", () => {
    attendanceRepository.upsert({
      ...base,
      commissionId: COMMISSION_2,
      status: AttendanceStatus.PRESENT,
    });

    const takenInCommission2 = attendanceRepository
      .getByCursada(CURSADA_1)
      .filter((record) => record.commission_id === COMMISSION_2);

    expect(takenInCommission2).toHaveLength(1);
    expect(takenInCommission2[0]?.enrollment_id).toBe(ENROLLMENT_1);
  });

  it("refuses a record whose enrollment belongs to another cursada", () => {
    expect(() =>
      attendanceRepository.upsert({
        ...base,
        enrollmentId: ENROLLMENT_OTHER_CURSADA,
        status: AttendanceStatus.PRESENT,
      }),
    ).toThrow();

    expect(attendanceRepository.getByCursada(CURSADA_1)).toHaveLength(0);
  });

  it("applies a bulk of decisions", () => {
    const records = attendanceRepository.bulkUpsert([
      { ...base, status: AttendanceStatus.PRESENT },
      { ...base, enrollmentId: ENROLLMENT_2, status: AttendanceStatus.ABSENT },
    ]);

    expect(records).toHaveLength(2);
    expect(records.map((record) => record.status)).toEqual([
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
    ]);
  });
});
