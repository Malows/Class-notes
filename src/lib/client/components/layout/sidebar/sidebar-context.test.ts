import { expect, test } from "vitest";
import { buildSubjectItems, buildPeriodItems, buildCommissionItems } from "./sidebar-context";
import type { Subject, Period, Commission } from "$lib/common";

test("buildSubjectItems filters and maps subjects correctly", () => {
  const subjects: Subject[] = [
    {
      id: 1,
      faculty_id: 1,
      name: "Matematica",
      faculty_name: "Facultad 1",
      faculty_slug: "facultad-1",
      slug: "matematica",
    },
    {
      id: 2,
      faculty_id: 2,
      name: "Fisica",
      faculty_name: "Facultad 2",
      faculty_slug: "facultad-2",
      slug: "fisica",
    },
  ];
  const context = { facultySlug: "facultad-1", activeSubjectSlug: "matematica" };

  const result = buildSubjectItems(subjects, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 1,
    href: "/faculties/facultad-1/subjects/matematica/periods",
    label: "Matematica",
    shortLabel: "MA",
    isActive: true,
  });
});

test("buildPeriodItems filters and maps periods correctly", () => {
  const periods: Period[] = [
    { id: 10, subject_id: 1, subject_slug: "matematica", year: 2026, semester: 1 },
    { id: 20, subject_id: 2, subject_slug: "fisica", year: 2026, semester: 2 },
  ];
  const context = { facultySlug: "facultad-1", subjectSlug: "matematica", activePeriodId: 10 };

  const result = buildPeriodItems(periods, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 10,
    href: "/faculties/facultad-1/subjects/matematica/periods/10/commissions",
    label: "2026 - 1º",
    shortLabel: "26-1",
    isActive: true,
  });
});

test("buildCommissionItems filters and maps commissions correctly", () => {
  const commissions: Commission[] = [
    { id: 100, subject_id: 1, period_id: 10, name: "Comision A", student_count: 5 },
    { id: 200, subject_id: 2, period_id: 20, name: "Comision B", student_count: 10 },
  ];
  const context = {
    facultySlug: "facultad-1",
    subjectSlug: "matematica",
    periodId: 10,
    activeCommissionId: 100,
  };

  const result = buildCommissionItems(commissions, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 100,
    href: "/faculties/facultad-1/subjects/matematica/periods/10/commissions/100/overview",
    label: "Comision A",
    shortLabel: "CO",
    isActive: true,
  });
});
