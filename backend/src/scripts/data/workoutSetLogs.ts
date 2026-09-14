export interface RawWorkoutSetLog {
  exerciseLog: any; // ObjectId
  setNumber: number;
  targetReps?: string;
  actualReps: number;
  weight: number;
  restDuration: number;
  startedAt?: Date;
  completedAt?: Date;
  completed: boolean;
}

const COMMON_WEIGHTS = [
  0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 110, 120,
];
const BODYWEIGHT_EXERCISES = [
  "Push Up",
  "Pull Up",
  "Plank",
  "Crunch",
  "Burpee",
  "Mountain Climber",
];

const parseReps = (targetRepsStr: string, seed: number): number => {
  if (!targetRepsStr) return 10;
  const cleaned = targetRepsStr.trim().toUpperCase();

  if (cleaned === "AMRAP") {
    return 12 + (seed % 9); // 12 ~ 20
  }
  if (cleaned === "FAILURE") {
    return 6 + (seed % 7); // 6 ~ 12
  }
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-").map((p) => parseInt(p.trim(), 10));
    const min = parts[0] || 8;
    const max = parts[1] || 10;
    const range = max - min + 1;
    return min + (seed % range);
  }
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 10 : parsed;
};

const getBaseWeight = (exerciseName: string, index: number): number => {
  const isBodyweight = BODYWEIGHT_EXERCISES.some((bw) =>
    exerciseName.toLowerCase().includes(bw.toLowerCase()),
  );
  if (isBodyweight) return 0;

  // Pick a realistic baseline weight from common weights based on index
  const weightIndex = (index * 3) % COMMON_WEIGHTS.length;
  return COMMON_WEIGHTS[weightIndex] || 40;
};

export const generateWorkoutSetLogsData = (
  workoutExerciseLogs: any[],
): RawWorkoutSetLog[] => {
  const setLogs: RawWorkoutSetLog[] = [];

  workoutExerciseLogs.forEach((exLog, logIndex) => {
    const targetSets = exLog.targetSets || 3;
    const targetRepsStr = exLog.targetReps || "10";
    const exerciseName = exLog.exerciseName || "";

    const baseWeight = getBaseWeight(exerciseName, logIndex);

    let currentSetStartedAt = new Date(exLog.createdAt || Date.now());

    for (let setNum = 1; setNum <= targetSets; setNum++) {
      // 90-95% completed
      const isCompleted = (logIndex * 5 + setNum) % 20 !== 0;

      let actualReps = 0;
      let weight = 0;

      if (isCompleted) {
        actualReps = parseReps(targetRepsStr, logIndex + setNum);

        // Consecutive sets weight progression/regression (-2.5 to 5kg max variation)
        const weightVariation =
          (setNum - 1) % 3 === 0 ? 0 : setNum % 2 === 0 ? 2.5 : 5;
        weight = Math.max(0, baseWeight + (setNum > 1 ? weightVariation : 0));

        const isBodyweight = BODYWEIGHT_EXERCISES.some((bw) =>
          exerciseName.toLowerCase().includes(bw.toLowerCase()),
        );
        if (isBodyweight) {
          weight = 0;
        }
      }

      // Rest duration between 45 and 180 seconds
      const restDuration = 45 + (((logIndex + setNum) * 15) % 136);

      const startedAt = new Date(currentSetStartedAt);

      // Set duration roughly 45-60 seconds of active work
      const workDurationSeconds = 45 + ((setNum * 7) % 20);
      const completedAt = new Date(
        startedAt.getTime() + workDurationSeconds * 1000,
      );

      setLogs.push({
        exerciseLog: exLog._id,
        setNumber: setNum,
        targetReps: targetRepsStr,
        actualReps,
        weight,
        restDuration,
        startedAt,
        completedAt,
        completed: isCompleted,
      });

      // Advance time for the next set (Work time + Rest time)
      currentSetStartedAt = new Date(
        completedAt.getTime() + restDuration * 1000,
      );
    }
  });

  return setLogs;
};
