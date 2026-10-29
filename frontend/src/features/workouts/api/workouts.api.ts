import { api } from "@/lib/axios";

import type {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  Workout,
  WorkoutDetails,
} from "../types/workout.types";

export const getWorkouts = async (
  params?: Record<string, any>,
): Promise<Workout[]> => {
  const response = await api.get("/workouts", {
    params: {
      limit: 100,
      ...params,
    },
  });

  return response.data.data.workouts;
};

export const getWorkout = async (id: string): Promise<WorkoutDetails> => {
  const response = await api.get(`/workouts/${id}`);

  return response.data.data.workout;
};

export const createWorkout = async (
  data: CreateWorkoutPayload,
): Promise<WorkoutDetails> => {
  const response = await api.post("/workouts", data);

  return response.data.data.workout;
};

export const updateWorkout = async (
  id: string,
  data: UpdateWorkoutPayload,
): Promise<WorkoutDetails> => {
  const response = await api.patch(`/workouts/${id}`, data);

  return response.data.data.workout;
};

export const duplicateWorkout = async (
  id: string,
  title?: string,
): Promise<WorkoutDetails> => {
  const response = await api.post(`/workouts/${id}/duplicate`, { title });

  return response.data.data.workout;
};

export const deleteWorkout = async (id: string): Promise<void> => {
  await api.delete(`/workouts/${id}`);
};

export interface ResolvedWorkoutResult {
  sourceType: "personal" | "template" | "assigned" | "shared" | "share";
  shareCode?: string;
  workout: WorkoutDetails & {
    creatorName?: string;
    exerciseCount?: number;
  };
  isAlreadySaved: boolean;
}

export const resolveWorkout = async (
  identifier: string,
): Promise<ResolvedWorkoutResult> => {
  const response = await api.post("/workouts/resolve", { identifier });
  return response.data.data;
};
