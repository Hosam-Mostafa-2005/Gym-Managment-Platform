import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

export type WorkoutSessionStatus =
  (typeof WORKOUT_SESSION_STATUS)[keyof typeof WORKOUT_SESSION_STATUS];

export interface IWorkoutSession {
  id?: string;
  member: string;
  assignment: string;

  status: WorkoutSessionStatus;

  startedAt: Date;
  endedAt?: Date;

  // Total session duration (in minutes)
  duration: number;

  // Total rest time (in seconds)
  totalRestTime: number;

  // Actual active training time (in seconds)
  activeTrainingTime: number;

  // Total volume (Weight × Reps)
  totalVolume: number;

  // Number of exercises completed
  exercisesCompleted: number;

  // Number of sets completed
  setsCompleted: number;

  notes?: string;

  isActive: boolean;

  progress: number;
}

export interface StartWorkoutSessionDto {
  assignment: string;
}

export interface FinishWorkoutSessionDto {
  notes?: string;
  sessionRpe?: number;
}

export interface ReviewWorkoutSessionDto {
  feedback: string;
}
