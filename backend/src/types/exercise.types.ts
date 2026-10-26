import type { Difficulty, Equipment } from "../constants/exercise.js";

export interface CreateExerciseDto {
  name: string;
  description?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  equipment: Equipment[];
  difficulty: Difficulty;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  tips?: string[];
  alternatives?: string[];
}

export type UpdateExerciseDto = Partial<CreateExerciseDto>;
