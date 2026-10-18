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
  const assignmentObj =
    typeof session.assignment === "object" && session.assignment !== null
      ? session.assignment
      : {};
  const trainerObj =
    typeof assignmentObj.trainer === "object" && assignmentObj.trainer !== null
      ? assignmentObj.trainer
      : {};
  const workoutObj =
    typeof assignmentObj.workout === "object" && assignmentObj.workout !== null
      ? assignmentObj.workout
      : {};

  return {
    id: session._id ?? session.id,

    assignment: {
      id:
        assignmentObj._id ??
        assignmentObj.id ??
        (typeof session.assignment === "string" ? session.assignment : ""),

      trainer: {
        id:
          trainerObj._id ??
          trainerObj.id ??
          (typeof assignmentObj.trainer === "string"
            ? assignmentObj.trainer
            : ""),
        name: trainerObj.name ?? "",
        email: trainerObj.email ?? "",
      },

      workout: {
        id:
          workoutObj._id ??
          workoutObj.id ??
          (typeof assignmentObj.workout === "string"
            ? assignmentObj.workout
            : ""),
        title: workoutObj.title ?? "",
        description: workoutObj.description,
        estimatedDuration: workoutObj.estimatedDuration ?? 0,
        category: workoutObj.category ?? "",
        difficulty: workoutObj.difficulty ?? "",
      },

      startDate: assignmentObj.startDate ?? "",
      endDate: assignmentObj.endDate,
      status: assignmentObj.status ?? "",
    },

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
