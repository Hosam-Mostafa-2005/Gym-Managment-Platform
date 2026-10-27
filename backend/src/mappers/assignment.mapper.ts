const mapAssignment = (assignment: any) => {
  const firstExercise = assignment.workout?.exercises?.[0]?.exercise;
  const imageUrl = assignment.workout?.imageUrl ?? firstExercise?.imageUrl ?? null;
  const exerciseCount = assignment.workout?.exercises?.length ?? 0;

  return {
    id: assignment._id ?? assignment.id,

    member: assignment.member
      ? typeof assignment.member === "object" &&
        ("name" in assignment.member || "email" in assignment.member)
        ? {
            id: assignment.member._id ?? assignment.member.id,
            name: assignment.member.name,
            email: assignment.member.email,
          }
        : {
            id: assignment.member,
          }
      : null,

    trainer: assignment.trainer
      ? typeof assignment.trainer === "object" &&
        ("name" in assignment.trainer || "email" in assignment.trainer)
        ? {
            id: assignment.trainer._id ?? assignment.trainer.id,
            name: assignment.trainer.name,
            email: assignment.trainer.email,
          }
        : {
            id: assignment.trainer,
          }
      : null,

    workout: assignment.workout
      ? typeof assignment.workout === "object" && "title" in assignment.workout
        ? {
            id: assignment.workout._id ?? assignment.workout.id,
            title: assignment.workout.title,
            description: assignment.workout.description,
            category: assignment.workout.category,
            difficulty: assignment.workout.difficulty,
            estimatedDuration: assignment.workout.estimatedDuration,
            imageUrl,
            exerciseCount,
            exercises: assignment.workout.exercises,
          }
        : {
            id: assignment.workout,
          }
      : null,

    startDate: assignment.startDate,

    endDate: assignment.endDate,

    status: assignment.status,

    progressPercentage:
      assignment.progressPercentage !== undefined
        ? assignment.progressPercentage
        : assignment.status === "COMPLETED"
          ? 100
          : 0,

    totalScheduled: assignment.totalScheduled ?? 0,
    completedScheduled: assignment.completedScheduled ?? 0,
    completedSessions: assignment.completedSessions ?? 0,

    completedAt: assignment.completedAt,

    cancelledAt: assignment.cancelledAt,

    cancelReason: assignment.cancelReason,

    notes: assignment.notes,

    createdAt: assignment.createdAt,

    updatedAt: assignment.updatedAt,
  };
};

export default mapAssignment;
