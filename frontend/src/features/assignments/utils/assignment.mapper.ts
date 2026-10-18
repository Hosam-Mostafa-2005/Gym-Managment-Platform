import type { Assignment } from "../types/assignment.types";

const extractId = (entity: any): string => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity.id ?? entity._id ?? "";
};

export const mapAssignment = (assignment: any): Assignment => ({
  id: extractId(assignment),

  member: {
    id: extractId(assignment.member),
    name: assignment.member?.name ?? "",
    email: assignment.member?.email ?? "",
  },

  trainer: {
    id: extractId(assignment.trainer),
    name: assignment.trainer?.name ?? "",
    email: assignment.trainer?.email ?? "",
  },

  workout: {
    id: extractId(assignment.workout),
    title: assignment.workout?.title ?? "",
    description: assignment.workout?.description,
    category: assignment.workout?.category,
    difficulty: assignment.workout?.difficulty,
    estimatedDuration: assignment.workout?.estimatedDuration,
    exercises: assignment.workout?.exercises,
  },

  startDate: assignment.startDate,
  endDate: assignment.endDate,

  status: assignment.status,

  completedAt: assignment.completedAt,
  cancelledAt: assignment.cancelledAt,
  cancelReason: assignment.cancelReason,

  notes: assignment.notes,

  createdAt: assignment.createdAt,
  updatedAt: assignment.updatedAt,
});
