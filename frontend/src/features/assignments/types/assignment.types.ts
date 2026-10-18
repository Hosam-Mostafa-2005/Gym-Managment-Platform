export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface AssignmentUser {
  id: string;
  name: string;
  email: string;
}

export interface AssignmentWorkout {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estimatedDuration?: number;
  exercises?: unknown[];
}

export interface Assignment {
  id: string;

  member: AssignmentUser;
  trainer: AssignmentUser;
  workout: AssignmentWorkout;

  startDate: string;
  endDate: string;

  status: AssignmentStatus;

  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentPayload {
  member: string;
  trainer: string;
  workout: string;

  startDate: string;
  endDate: string;

  notes?: string;
}

export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload> & {
  status?: AssignmentStatus;
  cancelReason?: string;
};
