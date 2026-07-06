import { Types } from "mongoose";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export interface IAssignment {
  member: Types.ObjectId;
  workout: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: AssignmentStatus;
  notes?: string;
  isActive: boolean;
}

export interface CreateAssignmentDto {
  member: Types.ObjectId;
  workout: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export type UpdateAssignmentDto = Partial<CreateAssignmentDto> & {
  status?: AssignmentStatus;
};
