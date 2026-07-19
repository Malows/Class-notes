import type { Period } from "$lib/common";

import { periodRepository } from "../repositories/period.repository";

export const periodService = {
  getAll: (subjectID?: number): Period[] => periodRepository.getAll(subjectID),
  create: (subject_id: number, year: number, semester: number): Period =>
    periodRepository.create(subject_id, year, semester),
  update: (id: number, year: number, semester: number): Period =>
    periodRepository.update(id, year, semester),
  delete: (id: number): void => {
    periodRepository.delete(id);
  },
};
