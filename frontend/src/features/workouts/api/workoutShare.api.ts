import { api } from "@/lib/axios";

export interface WorkoutSharePreviewData {
  shareId: string;
  shareCode: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
  importCount: number;
  workout: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedDuration: number;
    defaultRestLarge: number;
    defaultRestSmall: number;
    tags: string[];
    exerciseCount: number;
    creatorName: string;
    exercises: Array<{
      order: number;
      sets: number;
      reps: string;
      targetWeight?: number | null;
      targetRpe?: number | null;
      restSeconds: number;
      isRestOverridden?: boolean;
      notes?: string;
      exercise: {
        id: string;
        name: string;
        imageUrl?: string | null;
        primaryMuscles: string[];
        secondaryMuscles: string[];
        equipment: string[];
        difficulty: string;
      };
    }>;
  };
}

export interface CreatedShareResult {
  id: string;
  workoutId: string;
  workoutTitle: string;
  shareCode: string;
  shareToken: string;
  expiresAt: string | null;
  createdAt: string;
}

export const createWorkoutShare = async (
  workoutId: string,
  expiresAt?: string | null,
): Promise<CreatedShareResult> => {
  const response = await api.post<{ data: CreatedShareResult }>(
    `/workouts/${workoutId}/share`,
    { expiresAt },
  );
  return response.data.data;
};

export const getWorkoutSharePreview = async (
  tokenOrCode: string,
): Promise<WorkoutSharePreviewData> => {
  const response = await api.get<{ data: WorkoutSharePreviewData }>(
    `/workouts/share/preview?code=${encodeURIComponent(tokenOrCode)}`,
  );
  return response.data.data;
};

export const importSharedWorkout = async (
  tokenOrCode: string,
): Promise<any> => {
  const response = await api.post(
    `/workouts/share/import`,
    { tokenOrCode },
  );
  return response.data.data;
};

export const revokeWorkoutShare = async (shareId: string): Promise<void> => {
  await api.delete(`/workouts/share/${shareId}`);
};

export const getWorkoutShares = async (
  workoutId: string,
): Promise<any[]> => {
  const response = await api.get<{ data: any[] }>(
    `/workouts/${workoutId}/shares`,
  );
  return response.data.data;
};
