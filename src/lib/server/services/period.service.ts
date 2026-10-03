import type { Period } from "$lib/common";

import { periodRepository } from "../repositories/period.repository";

export const periodService = {
  getAll: (subjectID?: number): Period[] =>
    subjectID !== undefined ? periodRepository.getAllBySubject(subjectID) : periodRepository.getAll(),
  getAllBySubject: (subjectID: number): Period[] => periodRepository.getAllBySubject(subjectID),
  getById: (id: number): Period | undefined => periodRepository.getById(id),
  getByYearSemester: (year: number, semester: number): Period | undefined =>
    periodRepository.getByYearSemester(year, semester),
  create: (subject_id: number, year: number, semester: number): Period =>
    periodRepository.create(subject_id, year, semester),
  update: (id: number, year: number, semester: number): Period =>
    periodRepository.update(id, year, semester),
  delete: (id: number): void => {
    periodRepository.delete(id);
  },
};
