import type { Assignment } from "../types/assignment.types";

export const mapAssignment = (assignment: any): Assignment => ({
  id: assignment._id,

  member: {
    id: assignment.member._id ?? assignment.member,
    name: assignment.member.name ?? "",
    email: assignment.member.email ?? "",
  },

  trainer: {
    id: assignment.trainer._id,
    name: assignment.trainer.name,
    email: assignment.trainer.email,
  },

  workout: {
    id: assignment.workout._id,
    title: assignment.workout.title,
  },

  startDate: assignment.startDate,
  endDate: assignment.endDate,

  status: assignment.status,

  notes: assignment.notes,

  createdAt: assignment.createdAt,
  updatedAt: assignment.updatedAt,
});
