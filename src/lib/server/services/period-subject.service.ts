import type { Subject } from "$lib/common";

import { periodSubjectRepository } from "../repositories/period-subject.repository";

export const periodSubjectService = {
  getAll: (periodId: number): Subject[] => periodSubjectRepository.getAll(periodId),
  findCursadaId: (subjectId: number, periodId: number): number | null =>
    periodSubjectRepository.findBySubjectAndPeriod(subjectId, periodId),
  sync: (periodId: number, subjectIds: number[]): Subject[] =>
    periodSubjectRepository.sync(periodId, subjectIds),
};
