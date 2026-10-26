import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export interface IAssignment {
  id?: string;
  member: string;
  trainer: string;
  workout: string;

  startDate: Date;
  endDate: Date;

  status: AssignmentStatus;
  notes?: string;

  isActive: boolean;

  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;

  // timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssignmentDto {
  member: string;
  trainer?: string;
  workout: string;
  startDate: Date;
  endDate: Date;
  status?: AssignmentStatus;
  notes?: string;
}

export type UpdateAssignmentDto = Partial<CreateAssignmentDto> & {
  status?: AssignmentStatus;
  cancelReason?: string;
};
