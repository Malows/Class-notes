import { expect, test } from "vitest";
import {
  buildSubjectItems,
  buildPeriodItems,
  buildCommissionItems,
  termToSemester,
} from "./sidebar-context";
import type { Subject, Period, Commission } from "$lib/common";

const subjectFixture = (overrides: Partial<Subject> & Pick<Subject, "id">): Subject => ({
  faculty_id: 1,
  name: "Materia",
  faculty_name: "Facultad 1",
  faculty_slug: "facultad-1",
  slug: "materia",
  ...overrides,
});

test("termToSemester maps metadata terms to the period semester number", () => {
  expect(termToSemester("Cuatrimestre I")).toBe(1);
  expect(termToSemester("Cuatrimestre II")).toBe(2);
  expect(termToSemester(" Cuatrimestre II ")).toBe(2);
});

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
    {
      id: 10,
      subject_id: 1,
      subject_slug: "matematica",
      year: 2026,
      semester: 1,
    },
    {
      id: 20,
      subject_id: 2,
      subject_slug: "fisica",
      year: 2026,
      semester: 2,
    },
  ];
  const context = {
    facultySlug: "facultad-1",
    subjectSlug: "matematica",
    activePeriodYear: 2026,
    activePeriodSemester: 1,
  };

  const result = buildPeriodItems(periods, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 10,
    href: "/faculties/facultad-1/subjects/matematica/periods/2026/1/commissions",
    label: "2026 · 1º",
    shortLabel: "26-1",
    isActive: true,
  });
});

test("buildCommissionItems filters and maps commissions correctly", () => {
  const subjects: Subject[] = [subjectFixture({ id: 1, name: "Matematica", slug: "matematica" })];
  const commissions: Commission[] = [
    {
      id: 100,
      subject_id: 1,
      period_id: 10,
      name: "Comision A",
      slug: "comision-a",
      student_count: 5,
    },
    {
      id: 200,
      subject_id: 2,
      period_id: 20,
      name: "Comision B",
      slug: "comision-b",
      student_count: 10,
    },
  ];
  const context = {
    subjects,
    facultySlug: "facultad-1",
    subjectSlug: "matematica",
    periodId: 10,
    periodYear: 2026,
    periodSemester: 1,
    activeCommissionSlug: "comision-a",
  };

  const result = buildCommissionItems(commissions, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: 100,
    href: "/faculties/facultad-1/subjects/matematica/periods/2026/1/commissions/comision-a/overview",
    label: "Comision A",
    shortLabel: "CO",
    isActive: true,
  });
});

test("buildCommissionItems keeps only the current subject when two subjects share a period", () => {
  // Regression: the Fisica 2026/1 sidebar listed Historia de la Ciencia's
  // "Comisión Taller" because the filter used period_id alone. Both subjects
  // now share the same period id, so only cursada scoping can separate them.
  const subjects: Subject[] = [
    subjectFixture({
      id: 3,
      name: "Física General I",
      faculty_slug: "facultad-de-ingenieria",
      slug: "fisica-general-i",
    }),
    subjectFixture({
      id: 4,
      name: "Historia de la Ciencia",
      faculty_slug: "facultad-de-humanidades-y-artes",
      slug: "historia-de-la-ciencia",
    }),
  ];
  const commissions: Commission[] = [
    {
      id: 300,
      subject_id: 3,
      period_id: 30,
      name: "Comisión Virtual",
      slug: "comision-virtual",
      student_count: 4,
    },
    {
      id: 400,
      subject_id: 4,
      period_id: 30,
      name: "Comisión Taller",
      slug: "comision-taller",
      student_count: 8,
    },
  ];
  const context = {
    subjects,
    facultySlug: "facultad-de-ingenieria",
    subjectSlug: "fisica-general-i",
    periodId: 30,
    periodYear: 2026,
    periodSemester: 1,
    activeCommissionSlug: "comision-virtual",
  };

  const result = buildCommissionItems(commissions, context);

  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({
    id: 300,
    href: "/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/overview",
    label: "Comisión Virtual",
    isActive: true,
  });
  expect(result.some((item) => item.label === "Comisión Taller")).toBe(false);
});

test("buildCommissionItems builds the href from the commission's own subject payload", () => {
  const subjects: Subject[] = [
    subjectFixture({
      id: 3,
      name: "Física General I",
      faculty_slug: "facultad-de-ingenieria",
      slug: "fisica-general-i",
    }),
    subjectFixture({
      id: 5,
      name: "Física General II",
      faculty_slug: "facultad-de-ingenieria",
      slug: "fisica-general-ii",
    }),
  ];
  const commissions: Commission[] = [
    {
      id: 310,
      subject_id: 5,
      period_id: 30,
      name: "Comisión Laboratorio",
      slug: "comision-laboratorio",
      student_count: 0,
    },
  ];
  const context = {
    subjects,
    facultySlug: "facultad-de-ingenieria",
    subjectSlug: "fisica-general-ii",
    periodId: 30,
    periodYear: 2026,
    periodSemester: 1,
  };

  const result = buildCommissionItems(commissions, context);

  expect(result).toHaveLength(1);
  expect(result[0].href).toBe(
    "/faculties/facultad-de-ingenieria/subjects/fisica-general-ii/periods/2026/1/commissions/comision-laboratorio/overview",
  );
});

test("buildCommissionItems returns nothing when the page subject is not in the payload", () => {
  const subjects: Subject[] = [subjectFixture({ id: 3, slug: "fisica-general-i" })];
  const context = {
    subjects,
    facultySlug: "facultad-de-ingenieria",
    subjectSlug: "materia-inexistente",
    periodId: 30,
    periodYear: 2026,
    periodSemester: 1,
  };

  expect(buildCommissionItems([], context)).toEqual([]);
  expect(
    buildCommissionItems(
      [
        {
          id: 300,
          subject_id: 3,
          period_id: 30,
          name: "Comisión Virtual",
          slug: "comision-virtual",
          student_count: 4,
        },
      ],
      context,
    ),
  ).toEqual([]);
});
