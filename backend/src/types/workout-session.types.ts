import { Types } from "mongoose";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

export type WorkoutSessionStatus =
  (typeof WORKOUT_SESSION_STATUS)[keyof typeof WORKOUT_SESSION_STATUS];

export interface IWorkoutSession {
  member: Types.ObjectId;
  assignment: Types.ObjectId;

  status: WorkoutSessionStatus;

  startedAt: Date;
  endedAt?: Date;

  duration?: number;

  notes?: string;

  isActive: boolean;
}

export interface StartWorkoutSessionDto {
  assignment: string;
}

export interface FinishWorkoutSessionDto {
  notes?: string;
}
