import type { Difficulty, Category } from "../constants/workout.js";

export interface WorkoutExerciseDto {
  exercise: string; // Exercise ID

  sets: number;

  reps: string;

  restSeconds: number;

  notes?: string;

  order: number;
}

export interface CreateWorkoutDto {
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedDuration: number;
  category: Category;
  isTemplate?: boolean;
  tags?: string[];
  exercises: WorkoutExerciseDto[];
}

export type UpdateWorkoutDto = Partial<CreateWorkoutDto>;
