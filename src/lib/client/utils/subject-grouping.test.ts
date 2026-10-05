import { describe, expect, it } from "vitest";

import { groupSubjectsByFaculty } from "./subject-grouping";
import type { Subject } from "$lib/common/types/academic";

describe("groupSubjectsByFaculty", () => {
  it("groups subjects by faculty and sorts them by name", () => {
    const subjects: Subject[] = [
      {
        id: 3,
        name: "Física",
        faculty_id: 2,
        faculty_name: "Ciencias",
        faculty_slug: "ciencias",
        slug: "fisica",
      },
      {
        id: 1,
        name: "Álgebra",
        faculty_id: 1,
        faculty_name: "Ingeniería",
        faculty_slug: "ingenieria",
        slug: "algebra",
      },
      {
        id: 2,
        name: "Análisis",
        faculty_id: 1,
        faculty_name: "Ingeniería",
        faculty_slug: "ingenieria",
        slug: "analisis",
      },
    ];

    const grouped = groupSubjectsByFaculty(subjects);

    expect(grouped).toEqual([
      {
        facultyId: 2,
        facultySlug: "ciencias",
        facultyName: "Ciencias",
        subjects: [
          {
            id: 3,
            name: "Física",
            faculty_id: 2,
            faculty_name: "Ciencias",
            faculty_slug: "ciencias",
            slug: "fisica",
          },
        ],
      },
      {
        facultyId: 1,
        facultySlug: "ingenieria",
        facultyName: "Ingeniería",
        subjects: [
          {
            id: 1,
            name: "Álgebra",
            faculty_id: 1,
            faculty_name: "Ingeniería",
            faculty_slug: "ingenieria",
            slug: "algebra",
          },
          {
            id: 2,
            name: "Análisis",
            faculty_id: 1,
            faculty_name: "Ingeniería",
            faculty_slug: "ingenieria",
            slug: "analisis",
          },
        ],
      },
    ]);
  });
});