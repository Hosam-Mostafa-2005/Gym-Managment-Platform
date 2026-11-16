import { useQuery } from "@tanstack/react-query";
import {
  getExercises,
  getExerciseById,
  type ExerciseQueryParams,
} from "../api/exercises.api";

// 1. هوك مخصص للـ Pagination والـ Filters
export const useExercises = (
  pageOrParams: number | ExerciseQueryParams = 1,
  limit: number = 10,
  search?: string,
) => {
  return useQuery({
    queryKey: ["exercises", pageOrParams, limit, search],
    queryFn: () => getExercises(pageOrParams, limit, search),
  });
};

// 2. هوك لجلب التمارين دفعة واحدة (يستخدمه WorkoutForm والـ Combobox)
export const useAllExercises = (limit: number = 250) => {
  return useQuery({
    queryKey: ["exercises", "all", limit],
    queryFn: () => getExercises({ page: 1, limit }),
  });
};

export const useExercise = (id?: string, open?: boolean) => {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => getExerciseById(id!),
    enabled: !!id && open,
  });
};
