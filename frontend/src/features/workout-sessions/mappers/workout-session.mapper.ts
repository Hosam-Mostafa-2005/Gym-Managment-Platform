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

const mapExerciseLog = (log: any): WorkoutExerciseLog => ({
  id: log._id ?? log.id,

  exercise: {
    id: log.exercise._id ?? log.exercise.id,
    name: log.exercise.name,
    equipment: log.exercise.equipment,
    difficulty: log.exercise.difficulty,
    primaryMuscles: log.exercise.primaryMuscles,
    secondaryMuscles: log.exercise.secondaryMuscles,
  },

  exerciseName: log.exerciseName,
  targetSets: log.targetSets,
  targetReps: log.targetReps,
  order: log.order,
  completed: log.completed,

  sets: log.sets?.map(mapSet) ?? [],
});

export const mapWorkoutSession = (session: any): WorkoutSession => ({
  id: session._id ?? session.id,

  assignment: {
    id: session.assignment._id ?? session.assignment.id,

    trainer: {
      id: session.assignment.trainer._id ?? session.assignment.trainer.id,
      name: session.assignment.trainer.name,
      email: session.assignment.trainer.email,
    },

    workout: {
      id: session.assignment.workout._id ?? session.assignment.workout.id,
      title: session.assignment.workout.title,
      description: session.assignment.workout.description,
      estimatedDuration: session.assignment.workout.estimatedDuration,
      category: session.assignment.workout.category,
      difficulty: session.assignment.workout.difficulty,
    },

    startDate: session.assignment.startDate,
    endDate: session.assignment.endDate,
    status: session.assignment.status,
  },

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
});

export const mapWorkoutSessionDetails = (data: any): WorkoutSessionDetails => ({
  session: mapWorkoutSession(data.session),
  exerciseLogs: data.exerciseLogs.map(mapExerciseLog),
});
