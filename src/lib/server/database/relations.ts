import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  faculties: {
    subjects: r.many.subjects({ from: r.faculties.id, to: r.subjects.facultyId }),
  },
  subjects: {
    faculty: r.one.faculties({ from: r.subjects.facultyId, to: r.faculties.id }),
    commissions: r.many.commissions({ from: r.subjects.id, to: r.commissions.subjectId }),
    subjectPeriods: r.many.subjectPeriods({ from: r.subjects.id, to: r.subjectPeriods.subjectId }),
  },
  periods: {
    subjectPeriods: r.many.subjectPeriods({ from: r.periods.id, to: r.subjectPeriods.periodId }),
    commissions: r.many.commissions({ from: r.periods.id, to: r.commissions.periodId }),
  },
  subjectPeriods: {
    subject: r.one.subjects({ from: r.subjectPeriods.subjectId, to: r.subjects.id }),
    period: r.one.periods({ from: r.subjectPeriods.periodId, to: r.periods.id }),
    enrollments: r.many.enrollments({
      from: r.subjectPeriods.id,
      to: r.enrollments.subjectPeriodId,
    }),
  },
  commissions: {
    period: r.one.periods({ from: r.commissions.periodId, to: r.periods.id }),
    subject: r.one.subjects({ from: r.commissions.subjectId, to: r.subjects.id }),
    enrollments: r.many.enrollments({ from: r.commissions.id, to: r.enrollments.commissionId }),
  },
  persons: {
    enrollments: r.many.enrollments({ from: r.persons.id, to: r.enrollments.personId }),
  },
  enrollments: {
    person: r.one.persons({ from: r.enrollments.personId, to: r.persons.id }),
    subjectPeriod: r.one.subjectPeriods({
      from: r.enrollments.subjectPeriodId,
      to: r.subjectPeriods.id,
    }),
    commission: r.one.commissions({ from: r.enrollments.commissionId, to: r.commissions.id }),
  },
  assignments: {
    subjectPeriod: r.one.subjectPeriods({
      from: r.assignments.subjectPeriodId,
      to: r.subjectPeriods.id,
    }),
    deliveries: r.many.deliveries({ from: r.assignments.id, to: r.deliveries.assignmentId }),
  },
  deliveries: {
    assignment: r.one.assignments({ from: r.deliveries.assignmentId, to: r.assignments.id }),
    enrollment: r.one.enrollments({ from: r.deliveries.enrollmentId, to: r.enrollments.id }),
  },
}));
