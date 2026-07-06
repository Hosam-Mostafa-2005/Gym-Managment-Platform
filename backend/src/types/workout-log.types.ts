import { Types } from "mongoose";

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface IWorkoutLog {
  session: Types.ObjectId;
  exercise: Types.ObjectId;

  sets: WorkoutSet[];

  notes?: string;

  performedAt: Date;

  isActive: boolean;
}

export interface CreateWorkoutLogDto {
  session: string;
  exercise: string;

  sets: WorkoutSet[];

  notes?: string;
}

export type UpdateWorkoutLogDto = Partial<CreateWorkoutLogDto>;
