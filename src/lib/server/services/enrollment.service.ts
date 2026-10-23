import type {
  EnrollmentInput,
  EnrollmentRegistrationReport,
  EnrollmentWithPerson,
} from "$lib/common/types/enrollment";

import { enrollmentRepository } from "../repositories/enrollment.repository";
import { personRepository } from "../repositories/person.repository";
import { findPersonMatch } from "../utils/person-matching";

export const enrollmentService = {
  getRoster: (commissionId: number): EnrollmentWithPerson[] =>
    enrollmentRepository.getRoster(commissionId),
  getByCursada: (subjectPeriodId: number): EnrollmentWithPerson[] =>
    enrollmentRepository.getByCursada(subjectPeriodId),
  getPending: (subjectPeriodId: number): EnrollmentWithPerson[] =>
    enrollmentRepository.getPending(subjectPeriodId),
  assignCommission: (id: number, commissionId: number | null): EnrollmentWithPerson =>
    enrollmentRepository.assignCommission(id, commissionId),
  remove: (id: number): void => enrollmentRepository.remove(id),

  /**
   * Search-then-create registration. Each entry is matched by legajo, then by exact
   * name inside the cursada, and only unmatched entries create a new person.
   */
  register: (
    subjectPeriodId: number,
    entries: EnrollmentInput[],
    commissionId: number | null = null,
  ): EnrollmentRegistrationReport => {
    const existing = enrollmentRepository.getByCursada(subjectPeriodId);
    const byPerson = new Map(existing.map((enrollment) => [enrollment.person_id, enrollment]));
    const candidates = existing.map((enrollment) => ({
      id: enrollment.person_id,
      name: enrollment.name,
      legajo: enrollment.legajo,
    }));

    const enrollments: EnrollmentWithPerson[] = [];
    let created = 0;
    let reused = 0;

    for (const entry of entries) {
      const name = entry.name.trim();
      if (!name) {
        continue;
      }

      const legajo = entry.legajo?.trim() || null;
      const pinnedPerson = entry.person_id ? personRepository.findById(entry.person_id) : null;
      const registryPerson = pinnedPerson ?? (legajo ? personRepository.findByLegajo(legajo) : null);
      const matched = registryPerson ?? findPersonMatch({ name, legajo }, candidates);

      let enrollment: EnrollmentWithPerson;
      if (matched) {
        const alreadyEnrolled = byPerson.get(matched.id);
        if (alreadyEnrolled) {
          enrollment =
            commissionId !== null && alreadyEnrolled.commission_id === null
              ? enrollmentRepository.assignCommission(alreadyEnrolled.id, commissionId)
              : alreadyEnrolled;
        } else {
          enrollment = enrollmentRepository.enroll(matched.id, subjectPeriodId, commissionId);
        }
        byPerson.set(matched.id, enrollment);
        reused += 1;
      } else {
        const person = personRepository.create(name, legajo);
        enrollment = enrollmentRepository.enroll(person.id, subjectPeriodId, commissionId);
        byPerson.set(person.id, enrollment);
        candidates.push({ id: person.id, name: person.name, legajo: person.legajo });
        created += 1;
      }

      enrollments.push(enrollment);
    }

    return { created, reused, enrollments };
  },
};
