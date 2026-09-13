import { Types } from "mongoose";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export interface IAssignment {
  member: Types.ObjectId;
  trainer: Types.ObjectId;
  workout: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: AssignmentStatus;
  notes?: string;
  isActive: boolean;

  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

export interface CreateAssignmentDto {
  member: Types.ObjectId;
  trainer: Types.ObjectId;
  workout: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export type UpdateAssignmentDto = Partial<CreateAssignmentDto> & {
  status?: AssignmentStatus;
  cancelReason?: string;
};
