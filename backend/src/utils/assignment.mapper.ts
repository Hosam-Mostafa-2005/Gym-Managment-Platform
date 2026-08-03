const mapAssignment = (assignment: any) => ({
  id: assignment._id,

  member: assignment.member
    ? {
        id: assignment.member._id,
        name: assignment.member.name,
        email: assignment.member.email,
      }
    : null,

  trainer: assignment.trainer
    ? {
        id: assignment.trainer._id,
        name: assignment.trainer.name,
        email: assignment.trainer.email,
      }
    : null,

  workout: assignment.workout
    ? {
        id: assignment.workout._id,
        title: assignment.workout.title,
      }
    : null,

  startDate: assignment.startDate,

  endDate: assignment.endDate,

  status: assignment.status,

  notes: assignment.notes,

  createdAt: assignment.createdAt,

  updatedAt: assignment.updatedAt,
});

export default mapAssignment;
