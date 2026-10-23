import type { Assignment, AssignmentWorkflowStatus } from "$lib/common";

import { assignmentRepository } from "../repositories/assignment.repository";

export const assignmentService = {
  getAll: (subjectPeriodID?: number): Assignment[] => assignmentRepository.getAll(subjectPeriodID),
  create: (
    subject_period_id: number,
    title: string,
    subtitle: string,
    workflow_status: AssignmentWorkflowStatus,
  ): Assignment =>
    assignmentRepository.create(subject_period_id, title, subtitle, workflow_status),
  update: (id: number, title: string, subtitle: string): Assignment =>
    assignmentRepository.update(id, title, subtitle),
  updateStatus: (id: number, status: AssignmentWorkflowStatus): void =>
    assignmentRepository.updateStatus(id, status),
  delete: (id: number): void => {
    assignmentRepository.delete(id);
  },
  copy: (sourceSubjectPeriodID: number, targetSubjectPeriodID: number): void => {
    assignmentRepository.copy(sourceSubjectPeriodID, targetSubjectPeriodID);
  },
};
