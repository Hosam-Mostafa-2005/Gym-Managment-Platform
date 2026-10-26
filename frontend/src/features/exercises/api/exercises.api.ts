import { api } from "@/lib/axios";

import type {
  Exercise,
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../types/exercise.types";

export interface UploadExerciseImageResponse {
  imageUrl: string;
  storageKey: string;
  provider: string;
}

export const getExercises = async (page = 1, limit = 10) => {
  const { data } = await api.get("/exercises", {
    params: { page, limit },
  });
  return {
    exercises: data.data.exercises,
    results: data.results,
  };
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

export const uploadExerciseImage = async (
  file: File,
  options?: {
    exerciseId?: string;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  },
): Promise<UploadExerciseImageResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  if (options?.exerciseId) {
    formData.append("exerciseId", options.exerciseId);
  }

  const { data } = await api.post("/exercises/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal: options?.signal,
    onUploadProgress: (progressEvent) => {
      if (options?.onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        options.onProgress(Math.min(100, Math.max(0, percent)));
      }
    },
  });

  return data.data as UploadExerciseImageResponse;
};

export const deleteStagedExerciseImage = async (
  imageUrl: string,
): Promise<void> => {
  if (!imageUrl) return;
  try {
    await api.delete("/exercises/upload-image", {
      data: { imageUrl },
    });
  } catch {
    // Non-blocking cleanup
  }
};
