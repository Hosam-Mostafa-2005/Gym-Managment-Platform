const enrichWorkoutWithImage = (workout: any, fallbackExerciseLogs?: any[]) => {
  if (!workout) return null;

  const fromWorkoutExercises = Array.isArray(workout.exercises)
    ? (workout.exercises.find((item: any) => item?.exercise?.imageUrl)
        ?.exercise?.imageUrl ?? null)
    : null;

  const fromSessionLogs = Array.isArray(fallbackExerciseLogs)
    ? (fallbackExerciseLogs.find((log: any) => log?.exercise?.imageUrl)
        ?.exercise?.imageUrl ?? null)
    : null;

  const resolvedImageUrl =
    workout.imageUrl ?? fromWorkoutExercises ?? fromSessionLogs ?? null;

  const resolvedExerciseCount =
    typeof workout.exerciseCount === "number"
      ? workout.exerciseCount
      : Array.isArray(workout.exercises)
        ? workout.exercises.length
        : Array.isArray(fallbackExerciseLogs)
          ? fallbackExerciseLogs.length
          : undefined;

  return {
    ...workout,
    imageUrl: resolvedImageUrl,
    ...(resolvedExerciseCount !== undefined && {
      exerciseCount: resolvedExerciseCount,
    }),
  };
};

const mapWorkoutSession = (session: any, exerciseLogs?: any[] | unknown) => {
  const logs = Array.isArray(exerciseLogs)
    ? exerciseLogs
    : session.exerciseLogs;
  const rawWorkout = session.workout ?? session.assignment?.workout ?? null;
  const enrichedWorkout = enrichWorkoutWithImage(rawWorkout, logs);

  const enrichedAssignment = session.assignment
    ? {
        ...session.assignment,
        ...(session.assignment.workout && {
          workout: enrichWorkoutWithImage(session.assignment.workout, logs),
        }),
      }
    : null;

  return {
    id: session._id ?? session.id,
    assignment: enrichedAssignment,
    workout: enrichedWorkout,
    workoutId: session.workoutId ?? session.assignment?.workoutId ?? null,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    duration: session.duration ?? 0,
    progress: session.progress ?? 0,
    totalRestTime: session.totalRestTime ?? 0,
    activeTrainingTime: session.activeTrainingTime ?? 0,
    totalVolume: session.totalVolume ?? 0,
    exercisesCompleted: session.exercisesCompleted ?? 0,
    setsCompleted: session.setsCompleted ?? 0,
    notes: session.notes,
  };
};

export default mapWorkoutSession;
