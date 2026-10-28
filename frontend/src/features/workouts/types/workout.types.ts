import type { Exercise } from "@/features/exercises/types/exercise.types";
import type { z } from "zod";
import { workoutSchema } from "../schemas/workout.schema";

/* -------------------------------------------------------------------------- */
/*                           Workout Exercise Types                           */
/* -------------------------------------------------------------------------- */

export type PrescribedSetType = "NORMAL" | "DROP_SET" | "REST_PAUSE" | "WARMUP";

export interface PrescribedStage {
  segmentIndex: number;
  stageLabel?: string;
  targetWeight?: number;
  targetReps?: string | number;
}

export interface PrescribedSet {
  setNumber: number;
  setType: PrescribedSetType;
  targetWeight?: number;
  targetReps?: string | number;
  stages?: PrescribedStage[];
}

export interface WorkoutExercise {
  exercise: string;

  sets: number;

  reps: string;

  targetWeight?: number | null;

  targetRpe?: number | null;

  restSeconds: number;

  isRestOverridden?: boolean;

  notes?: string;

  order: number;

  setsDetail?: PrescribedSet[];
}

export interface WorkoutExerciseDetails {
  exercise: Exercise;

  sets: number;

  reps: string;

  targetWeight?: number | null;

  targetRpe?: number | null;

  restSeconds: number;

  isRestOverridden?: boolean;

  notes?: string;

  order: number;

  setsDetail?: PrescribedSet[];
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

  defaultRestLarge?: number;

  defaultRestSmall?: number;

  tags: string[];

  isTemplate: boolean;

  isActive: boolean;

  imageUrl?: string | null;

  exerciseCount?: number;

  createdById?: string;

  createdBy?: string | {
    id: string;
    name: string;
  };

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
