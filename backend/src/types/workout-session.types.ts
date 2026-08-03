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

  // مدة السيشن بالكامل (بالدقائق)
  duration: number;

  // إجمالي وقت الراحة (بالثواني)
  totalRestTime: number;

  // الوقت الفعلي للتمرين بدون الراحة (بالثواني)
  activeTrainingTime: number;

  // إجمالي الحجم (Weight × Reps)
  totalVolume: number;

  // عدد التمارين المكتملة
  exercisesCompleted: number;

  // عدد المجموعات المكتملة
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
}
