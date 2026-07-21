import { api } from "@/lib/axios";

import type {
  CreateWorkoutPayload,
  UpdateWorkoutPayload,
  Workout,
  WorkoutDetails,
} from "../types/workout.types";

export const getWorkouts = async (): Promise<Workout[]> => {
  const response = await api.get("/workouts");

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

export const deleteWorkout = async (id: string): Promise<void> => {
  await api.delete(`/workouts/${id}`);
};
