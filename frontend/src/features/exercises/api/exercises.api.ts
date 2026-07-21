import { api } from "@/lib/axios";

import type {
  Exercise,
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../types/exercise.types";

export const getExercises = async (): Promise<Exercise[]> => {
  const { data } = await api.get("/exercises");

  return data.data.exercises;
};

export const createExercise = async (exercise: CreateExerciseDto) => {
  const { data } = await api.post("/exercises", exercise);
  return data.data as Exercise;
};

export const getExerciseById = async (id: string): Promise<Exercise> => {
  const { data } = await api.get(`/exercises/${id}`);

  return data.data.exercise;
};

export const updateExercise = async (
  id: string,
  exercise: UpdateExerciseDto,
) => {
  const { data } = await api.patch(`/exercises/${id}`, exercise);
  return data.data as Exercise;
};

export const deleteExercise = async (id: string) => {
  await api.delete(`/exercises/${id}`);
};
