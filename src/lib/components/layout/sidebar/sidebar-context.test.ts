import { expect, test } from "vitest";
import { buildSubjectItems, buildPeriodItems, buildCommissionItems } from "./sidebar-context";
import type { Subject, Period, Commission } from "$lib/types";

test("buildSubjectItems filters and maps subjects correctly", () => {
  const subjects: Subject[] = [
    { id: 1, faculty_id: 1, name: "Matematica" },
    { id: 2, faculty_id: 2, name: "Fisica" },
  ];
  const context = { facultyId: 1, activeSubjectId: 1 };

  const result = buildSubjectItems(subjects, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 1,
    href: "/faculties/1/subjects/1/periods",
    label: "Matematica",
    shortLabel: "MA",
    isActive: true,
  });
});

test("buildPeriodItems filters and maps periods correctly", () => {
  const periods: Period[] = [
    { id: 10, subject_id: 1, year: 2026, semester: 1 },
    { id: 20, subject_id: 2, year: 2026, semester: 2 },
  ];
  const context = { facultyId: 1, subjectId: 1, activePeriodId: 10 };

  const result = buildPeriodItems(periods, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 10,
    href: "/faculties/1/subjects/1/periods/10/commissions",
    label: "2026 - 1º",
    shortLabel: "26-1",
    isActive: true,
  });
});

test("buildCommissionItems filters and maps commissions correctly", () => {
  const commissions: Commission[] = [
    { id: 100, period_id: 10, name: "Comision A", student_count: 5 },
    { id: 200, period_id: 20, name: "Comision B", student_count: 10 },
  ];
  const context = { facultyId: 1, subjectId: 1, periodId: 10, activeCommissionId: 100 };

  const result = buildCommissionItems(commissions, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 100,
    href: "/faculties/1/subjects/1/periods/10/commissions/100/overview",
    label: "Comision A",
    shortLabel: "CO",
    isActive: true,
  });
});
