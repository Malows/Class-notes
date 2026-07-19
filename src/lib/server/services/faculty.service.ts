import type { Faculty } from "$lib/common";

import { facultyRepository } from "../repositories/faculty.repository";

export const facultyService = {
  getAll: (): Faculty[] => facultyRepository.getAll(),
  create: (name: string): Faculty => facultyRepository.create(name),
  update: (id: number, name: string): Faculty => facultyRepository.update(id, name),
  delete: (id: number): void => {
    facultyRepository.delete(id);
  },
};
