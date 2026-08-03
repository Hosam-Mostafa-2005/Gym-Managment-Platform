export interface SetLog {
  weight: number;
  reps: number;
}

export interface RawWorkoutLog {
  session: any; // ObjectId
  exercise: any; // ObjectId
  sets: SetLog[];
  notes?: string;
}

export const generateWorkoutLogsData = (
  completedSessions: any[],
  workouts: any[],
  assignments: any[],
): RawWorkoutLog[] => {
  const logs: RawWorkoutLog[] = [];

  completedSessions.forEach((session) => {
    // Trace the assignment to find the associated workout routine
    const assignment = assignments.find(
      (a) => a._id.toString() === session.assignment.toString(),
    );
    if (!assignment) return;

    const workout = workouts.find(
      (w) => w._id.toString() === assignment.workout.toString(),
    );
    if (!workout || !workout.exercises) return;

    workout.exercises.forEach((item: any, exIndex: number) => {
      const targetSets = item.sets || 3;
      const setsData: SetLog[] = [];

      let baseWeight = 20;
      if (exIndex === 0) baseWeight = 60;
      else if (exIndex === 1) baseWeight = 40;
      else baseWeight = 15;

      for (let s = 1; s <= targetSets; s++) {
        const weight = baseWeight + (s - 1) * 2.5;
        const reps = Math.max(12 - (s - 1) * 2, 6);

        setsData.push({
          weight,
          reps,
        });
      }

      logs.push({
        session: session._id,
        exercise: item.exercise,
        sets: setsData,
        notes: `Executed with clean form. Rested ${item.restSeconds || 60}s between sets.`,
      });
    });
  });

  return logs;
};
