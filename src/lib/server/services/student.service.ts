import type { Student } from "$lib/common";

import { studentRepository } from "../repositories/student.repository";

export const studentService = {
  getAll: (commissionID?: number): Student[] => studentRepository.getAll(commissionID),
  createBulk: (commission_id: number, names: string[]): void =>
    studentRepository.createBulk(commission_id, names),
  update: (id: number, name: string): Student => studentRepository.update(id, name),
  delete: (id: number): void => {
    studentRepository.delete(id);
  },
};
