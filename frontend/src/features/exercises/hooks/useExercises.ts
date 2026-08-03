import { useQuery } from "@tanstack/react-query";
import { getExercises, getExerciseById } from "../api/exercises.api";

// 1. هوك مخصص للـ Pagination (يستخدمه جدول التمارين في صفحة Exercises)
export const useExercises = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["exercises", page, limit],
    queryFn: () => getExercises(page, limit),
  });
};

// 2. هوك جديد لجلب كل التمارين دفعة واحدة (يستخدمه WorkoutForm والـ Combobox)
export const useAllExercises = () => {
  return useQuery({
    queryKey: ["exercises", "all"],
    queryFn: () => getExercises(1, 100), // جلب أول 100 تمرين لضمان شمول المكتبة بالكامل
  });
};

export const useExercise = (id?: string, open?: boolean) => {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => getExerciseById(id!),
    enabled: !!id && open,
  });
};
