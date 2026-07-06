import type { Difficulty, Equipment } from "../constants/exercise.js";

export interface CreateExerciseDto {
  name: string;
  description?: string;
  videoUrl?: string;
  equipment: Equipment[];
  difficulty: Difficulty;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  tips?: string[];
  alternatives?: string[];
}

export type UpdateExerciseDto = Partial<CreateExerciseDto>;
