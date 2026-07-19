import type { Subject } from "$lib/common";

import { subjectRepository } from "../repositories/subject.repository";

export const subjectService = {
  getAll: (): Subject[] => subjectRepository.getAll(),
  create: (faculty_id: number, name: string): Subject => subjectRepository.create(faculty_id, name),
  update: (id: number, name: string): Subject => subjectRepository.update(id, name),
  delete: (id: number): void => {
    subjectRepository.delete(id);
  },
};
