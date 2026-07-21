import type { Exercise } from "@/features/exercises/types/exercise.types";
import type { z } from "zod";
import { workoutSchema } from "../schemas/workout.schema";

/* -------------------------------------------------------------------------- */
/*                           Workout Exercise Types                           */
/* -------------------------------------------------------------------------- */

export interface WorkoutExercise {
  exercise: string;

  sets: number;

  reps: string;

  restSeconds: number;

  notes?: string;

  order: number;
}

export interface WorkoutExerciseDetails {
  exercise: Exercise;

  sets: number;

  reps: string;

  restSeconds: number;

  notes?: string;

  order: number;
}

/* -------------------------------------------------------------------------- */
/*                               Workout Types                                */
/* -------------------------------------------------------------------------- */

export interface Workout {
  id: string;
  _id?: string;

  title: string;

  description: string;

  category: string;

  difficulty: string;

  estimatedDuration: number;

  tags: string[];

  isTemplate: boolean;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface WorkoutDetails extends Workout {
  exercises: WorkoutExerciseDetails[];

  createdBy: {
    id: string;

    name: string;
  };
}

/* -------------------------------------------------------------------------- */
/*                               Request Types                                */
/* -------------------------------------------------------------------------- */

export type CreateWorkoutPayload = z.infer<typeof workoutSchema>;

export type UpdateWorkoutPayload = Partial<CreateWorkoutPayload>;

/* -------------------------------------------------------------------------- */
/*                                Query Types                                 */
/* -------------------------------------------------------------------------- */

export interface WorkoutFilters {
  page?: number;

  limit?: number;

  search?: string;

  sort?: string;
}
