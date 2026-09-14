// src/mappers/members-management.mapper.ts

export const mapMemberManagementCard = (data: any) => {
  const assignment = data.currentAssignment;
  const trainer = data.trainer;
  const workout = data.workout;
  return {
    member: {
      id: data._id.toString(),
      name: data.name,
      email: data.email,
      isActive: data.isActive,
      joinedAt: data.createdAt,
    },
    assignment: assignment
      ? {
          status: assignment.status,
          currentWorkout: workout
            ? {
                id: workout._id.toString(),
                title: workout.title,
              }
            : null,
          trainer: trainer
            ? {
                id: trainer._id.toString(),
                name: trainer.name,
              }
            : null,
        }
      : null,
    workout: {
      completionRate: Math.round(data.completionRate || 0),
      lastWorkout: data.lastWorkoutDate || null,
    },
    measurements: {
      latestWeight: data.latestWeight || null,
    },
  };
};
