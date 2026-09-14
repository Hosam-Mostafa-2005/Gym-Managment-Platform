export interface RawWorkoutExerciseLog {
  session: any; // ObjectId
  exercise: any; // ObjectId
  exerciseName: string;
  targetSets: number;
  targetReps: string;
  order: number;
  completed: boolean;
}

export const generateWorkoutExerciseLogsData = (
  completedSessions: any[],
  workouts: any[],
  assignments: any[],
): RawWorkoutExerciseLog[] => {
  const exerciseLogs: RawWorkoutExerciseLog[] = [];

  // Create lookup maps for performance
  const assignmentMap = new Map(assignments.map((a) => [a._id.toString(), a]));
  const workoutMap = new Map(workouts.map((w) => [w._id.toString(), w]));

  completedSessions.forEach((session, sessionIndex) => {
    const assignmentId =
      session.assignment?.toString() || session.assignment?._id?.toString();
    if (!assignmentId) return;

    const assignment = assignmentMap.get(assignmentId);
    if (!assignment) return;

    const workoutId =
      assignment.workout?.toString() || assignment.workout?._id?.toString();
    if (!workoutId) return;

    const workout = workoutMap.get(workoutId);
    if (!workout || !workout.exercises) return;

    // Iterate through every exercise defined in the workout template/definition
    workout.exercises.forEach((workoutExercise: any, exerciseIndex: number) => {
      // Determine if completed (Around 90% true, ~10% false)
      const isCompleted = (sessionIndex * 7 + exerciseIndex) % 10 !== 0;

      // Extract exercise reference and name safely
      const exerciseRef =
        workoutExercise.exercise?._id || workoutExercise.exercise;
      const exerciseName =
        workoutExercise.exercise?.name ||
        workoutExercise.name ||
        "Strength Exercise";

      exerciseLogs.push({
        session: session._id,
        exercise: exerciseRef,
        exerciseName,
        targetSets: workoutExercise.sets,
        targetReps: workoutExercise.reps,
        order: workoutExercise.order ?? exerciseIndex + 1,
        completed: isCompleted,
      });
    });
  });

  return exerciseLogs;
};
