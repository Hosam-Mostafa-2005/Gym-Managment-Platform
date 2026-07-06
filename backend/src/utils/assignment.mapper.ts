import type { IAssignment } from "../types/assignment.types.js";

const mapAssignment = (assignment: any) => ({
  id: assignment._id,

  member: {
    id: assignment.member._id,
    name: assignment.member.name,
    email: assignment.member.email,
  },

  workout: {
    id: assignment.workout._id,
    title: assignment.workout.title,
  },

  startDate: assignment.startDate,
  endDate: assignment.endDate,

  status: assignment.status,
});

export default mapAssignment;
