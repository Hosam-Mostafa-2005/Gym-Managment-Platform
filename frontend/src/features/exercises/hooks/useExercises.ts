import { useQuery } from "@tanstack/react-query";

import { getExercises } from "../api/exercises.api";
import { getExerciseById } from "../api/exercises.api";

export const useExercises = () => {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: getExercises,
  });
};

export const useExercise = (id?: string, open?: boolean) => {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => getExerciseById(id!),
    enabled: !!id && open,
  });
};
