import type {
  WorkoutSession,
  WorkoutSessionDetails,
  WorkoutExerciseLog,
  WorkoutSetLog,
} from "../types/workout-session.types";

const mapSet = (set: any): WorkoutSetLog => ({
  id: set._id ?? set.id,
  setNumber: set.setNumber,
  targetReps: set.targetReps,
  actualReps: set.actualReps,
  weight: set.weight,
  restDuration: set.restDuration ?? 0,
  completedAt: set.completedAt,
  completed: set.completed,
});

const mapExerciseLog = (log: any): WorkoutExerciseLog => {
  const exerciseObj =
    typeof log.exercise === "object" && log.exercise !== null
      ? log.exercise
      : {};

  return {
    id: log._id ?? log.id,
    exercise: {
      id:
        exerciseObj._id ??
        exerciseObj.id ??
        (typeof log.exercise === "string" ? log.exercise : ""),
      name: exerciseObj.name ?? log.exerciseName ?? "",
      equipment: exerciseObj.equipment ?? [],
      difficulty: exerciseObj.difficulty ?? "",
      primaryMuscles: exerciseObj.primaryMuscles ?? [],
      secondaryMuscles: exerciseObj.secondaryMuscles ?? [],
      description: exerciseObj.description ?? "",
      instructions: exerciseObj.instructions ?? [],
      tips: exerciseObj.tips ?? [],
      imageUrl: exerciseObj.imageUrl ?? null,
      videoUrl: exerciseObj.videoUrl ?? undefined,
    },
    exerciseName: log.exerciseName,
    targetSets: log.targetSets,
    targetReps: log.targetReps,
    order: log.order,
    completed: log.completed,
    sets: log.sets?.map(mapSet) ?? [],
  };
};

export const mapWorkoutSession = (session: any): WorkoutSession => {
  const assignmentRaw = session.assignment;
  let assignment: any = null;

  if (assignmentRaw && typeof assignmentRaw === "object") {
    const trainerObj =
      typeof assignmentRaw.trainer === "object" && assignmentRaw.trainer !== null
        ? assignmentRaw.trainer
        : {};
    const workoutObj =
      typeof assignmentRaw.workout === "object" && assignmentRaw.workout !== null
        ? assignmentRaw.workout
        : {};

    assignment = {
      id: assignmentRaw._id ?? assignmentRaw.id ?? "",
      trainer: {
        id: trainerObj._id ?? trainerObj.id ?? "",
        name: trainerObj.name ?? "",
        email: trainerObj.email ?? "",
      },
      workout: {
        id: workoutObj._id ?? workoutObj.id ?? "",
        title: workoutObj.title ?? "",
        description: workoutObj.description,
        estimatedDuration: workoutObj.estimatedDuration ?? 0,
        category: workoutObj.category ?? "",
        difficulty: workoutObj.difficulty ?? "",
        imageUrl: workoutObj.imageUrl ?? null,
        exerciseCount: workoutObj.exerciseCount ?? workoutObj.exercises?.length ?? 0,
      },
      startDate: assignmentRaw.startDate ?? "",
      endDate: assignmentRaw.endDate,
      status: assignmentRaw.status ?? "",
    };
  }

  const workoutRaw =
    (session.workout && typeof session.workout === "object"
      ? session.workout
      : assignment?.workout) || null;

  const workout = workoutRaw
    ? {
        id: workoutRaw._id ?? workoutRaw.id ?? "",
        title: workoutRaw.title ?? "",
        description: workoutRaw.description,
        estimatedDuration: workoutRaw.estimatedDuration ?? 0,
        category: workoutRaw.category ?? "",
        difficulty: workoutRaw.difficulty ?? "",
        imageUrl: workoutRaw.imageUrl ?? null,
        exerciseCount: workoutRaw.exerciseCount ?? workoutRaw.exercises?.length ?? 0,
      }
    : null;

  return {
    id: session._id ?? session.id,
    assignment,
    workout,
    workoutId: session.workoutId ?? assignment?.workout?.id ?? null,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    duration: session.duration ?? 0,
    progress: session.progress ?? 0,
    notes: session.notes,
    totalRestTime: session.totalRestTime ?? 0,
    activeTrainingTime: session.activeTrainingTime ?? 0,
    totalVolume: session.totalVolume ?? 0,
    exercisesCompleted: session.exercisesCompleted ?? 0,
    setsCompleted: session.setsCompleted ?? 0,
  };
};

export const mapWorkoutSessionDetails = (data: any): WorkoutSessionDetails => ({
  session: mapWorkoutSession(data.session),
  exerciseLogs: (data.exerciseLogs ?? []).map(mapExerciseLog),
});
