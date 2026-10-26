// src/features/nutrition/hooks/useNutrition.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNutritionOverview,
  getNutritionProfile,
  completeOnboarding,
  logFood,
  updateFoodLog,
  deleteFoodLog,
  getNutritionHistory,
  searchFoods,
  getFoodCategories,
  getCoachEligibleMembers,
  getCoachMemberNutrition,
  createCoachPlan,
} from "../api/nutrition.api";
import type {
  OnboardingPayload,
  LogFoodPayload,
  UpdateFoodLogPayload,
  CreateCoachPlanPayload,
} from "../types/nutrition.types";

export const NUTRITION_QUERY_KEYS = {
  all: ["nutrition"] as const,
  overview: (date?: string) => ["nutrition", "overview", date ?? "today"] as const,
  profile: () => ["nutrition", "profile"] as const,
  history: (days = 30) => ["nutrition", "history", days] as const,
  foods: (params: Record<string, any>) => ["nutrition", "foods", params] as const,
  categories: () => ["nutrition", "categories"] as const,
  coachMembers: () => ["nutrition", "coach", "members"] as const,
  coachMemberDetail: (memberId: string, date?: string) =>
    ["nutrition", "coach", "member", memberId, date ?? "today"] as const,
};

export const useNutritionOverview = (date?: string) => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.overview(date),
    queryFn: () => getNutritionOverview(date),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useNutritionProfile = () => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.profile(),
    queryFn: () => getNutritionProfile(),
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OnboardingPayload) => completeOnboarding(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUTRITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
};

export const useLogFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LogFoodPayload) => logFood(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUTRITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
};

export const useUpdateFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logId,
      payload,
    }: {
      logId: string;
      payload: UpdateFoodLogPayload;
    }) => updateFoodLog(logId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUTRITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
};

export const useDeleteFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => deleteFoodLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUTRITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
};

export const useNutritionHistory = (days = 30) => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.history(days),
    queryFn: () => getNutritionHistory(days),
  });
};

export const useSearchFoods = (params: {
  search?: string;
  category?: string;
  excludeAllergens?: string[];
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.foods(params),
    queryFn: () => searchFoods(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useFoodCategories = () => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.categories(),
    queryFn: () => getFoodCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// ==========================================
// COACH HOOKS
// ==========================================

export const useCoachEligibleMembers = () => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.coachMembers(),
    queryFn: () => getCoachEligibleMembers(),
  });
};

export const useCoachMemberNutrition = (memberId: string, date?: string) => {
  return useQuery({
    queryKey: NUTRITION_QUERY_KEYS.coachMemberDetail(memberId, date),
    queryFn: () => getCoachMemberNutrition(memberId, date),
    enabled: !!memberId,
  });
};

export const useCreateCoachPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoachPlanPayload) => createCoachPlan(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: NUTRITION_QUERY_KEYS.coachMembers(),
      });
      queryClient.invalidateQueries({
        queryKey: NUTRITION_QUERY_KEYS.coachMemberDetail(variables.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};
