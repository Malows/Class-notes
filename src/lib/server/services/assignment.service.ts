import type { Assignment, AssignmentWorkflowStatus } from "$lib/common";

import { assignmentRepository } from "../repositories/assignment.repository";

export const assignmentService = {
  getAll: (periodID?: number): Assignment[] => assignmentRepository.getAll(periodID),
  create: (
    period_id: number,
    title: string,
    subtitle: string,
    workflow_status: AssignmentWorkflowStatus,
  ): Assignment => assignmentRepository.create(period_id, title, subtitle, workflow_status),
  update: (id: number, title: string, subtitle: string): Assignment =>
    assignmentRepository.update(id, title, subtitle),
  updateStatus: (id: number, status: AssignmentWorkflowStatus): Assignment =>
    assignmentRepository.updateStatus(id, status),
  delete: (id: number): void => {
    assignmentRepository.delete(id);
  },
  copy: (sourcePeriodID: number, targetPeriodID: number): void => {
    assignmentRepository.copy(sourcePeriodID, targetPeriodID);
  },
};
