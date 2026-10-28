import type { Difficulty, Category } from "../constants/workout.js";

export interface PrescribedStageDto {
  stageNumber?: number;
  segmentIndex: number;
  stageLabel?: string;
  targetWeight?: number | null;
  targetReps?: string | number;
  isIntermediateSegment?: boolean;
  isFinalSegment?: boolean;
}

export interface PrescribedSetDto {
  setNumber: number;
  setType: "NORMAL" | "DROP_SET" | "REST_PAUSE" | "WARMUP";
  targetWeight?: number | null;
  targetReps?: string | number;
  stages?: PrescribedStageDto[];
}

export interface WorkoutExerciseDto {
  exercise: string; // Exercise ID
  sets: number;
  reps: string;
  targetWeight?: number | null;
  targetRpe?: number | null;
  restSeconds?: number;
  isRestOverridden?: boolean;
  notes?: string;
  order: number;
  setsDetail?: PrescribedSetDto[];
}

export interface CreateWorkoutDto {
  title: string;
  description?: string;
  difficulty: Difficulty;
  estimatedDuration: number;
  defaultRestLarge?: number;
  defaultRestSmall?: number;
  category: Category;
  isTemplate?: boolean;
  tags?: string[];
  exercises: WorkoutExerciseDto[];
}

export type UpdateWorkoutDto = Partial<CreateWorkoutDto>;
