export interface Exercise {
  id: string;
  _id?: string;
  name: string;
  description: string;
  videoUrl?: string;

  equipment: string[];
  difficulty: string;

  primaryMuscles: string[];
  secondaryMuscles: string[];

  instructions: string[];
  tips: string[];

  alternatives: string[];

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseDto {
  name: string;
  description: string;
  videoUrl?: string;

  equipment: string[];
  difficulty: string;

  primaryMuscles: string[];
  secondaryMuscles: string[];

  instructions: string[];
  tips: string[];
}

export type UpdateExerciseDto = Partial<CreateExerciseDto>;
