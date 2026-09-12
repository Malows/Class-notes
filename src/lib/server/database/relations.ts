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
    assignments: r.many.assignments({ from: r.periods.id, to: r.assignments.periodId }),
  },
  subjectPeriods: {
    subject: r.one.subjects({ from: r.subjectPeriods.subjectId, to: r.subjects.id }),
    period: r.one.periods({ from: r.subjectPeriods.periodId, to: r.periods.id }),
  },
  commissions: {
    period: r.one.periods({ from: r.commissions.periodId, to: r.periods.id }),
    subject: r.one.subjects({ from: r.commissions.subjectId, to: r.subjects.id }),
    students: r.many.students({ from: r.commissions.id, to: r.students.commissionId }),
  },
  students: {
    commission: r.one.commissions({ from: r.students.commissionId, to: r.commissions.id }),
    deliveries: r.many.deliveries({ from: r.students.id, to: r.deliveries.studentId }),
  },
  assignments: {
    period: r.one.periods({ from: r.assignments.periodId, to: r.periods.id }),
    deliveries: r.many.deliveries({ from: r.assignments.id, to: r.deliveries.assignmentId }),
  },
  deliveries: {
    assignment: r.one.assignments({ from: r.deliveries.assignmentId, to: r.assignments.id }),
    student: r.one.students({ from: r.deliveries.studentId, to: r.students.id }),
  },
}));
