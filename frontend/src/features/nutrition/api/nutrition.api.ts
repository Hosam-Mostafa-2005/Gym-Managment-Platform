// src/features/nutrition/api/nutrition.api.ts
import { api } from "@/lib/axios";
import type {
  NutritionOverview,
  MemberProfileResponse,
  OnboardingPayload,
  LogFoodPayload,
  UpdateFoodLogPayload,
  FoodLogItem,
  NutritionHistoryResponse,
  FoodItem,
  CreateCustomFoodPayload,
  UpdateCustomFoodPayload,
  CoachEligibleMember,
  CoachMemberNutritionView,
  CreateCoachPlanPayload,
  NutritionPlan,
} from "../types/nutrition.types";

export const getNutritionOverview = async (
  date?: string,
): Promise<NutritionOverview> => {
  const { data } = await api.get("/nutrition/me/overview", {
    params: date ? { date } : undefined,
  });
  return data.data;
};

export const getNutritionProfile = async (): Promise<MemberProfileResponse> => {
  const { data } = await api.get("/nutrition/me/profile");
  return data.data;
};

export const completeOnboarding = async (
  payload: OnboardingPayload,
): Promise<any> => {
  const { data } = await api.post("/nutrition/me/onboard", payload);
  return data.data;
};

export const logFood = async (
  payload: LogFoodPayload,
): Promise<{ log: FoodLogItem }> => {
  const { data } = await api.post("/nutrition/me/logs", payload);
  return data.data;
};

export const updateFoodLog = async (
  logId: string,
  payload: UpdateFoodLogPayload,
): Promise<{ log: FoodLogItem }> => {
  const { data } = await api.patch(`/nutrition/me/logs/${logId}`, payload);
  return data.data;
};

export const deleteFoodLog = async (
  logId: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/nutrition/me/logs/${logId}`);
  return data;
};

export const getNutritionHistory = async (
  days = 30,
): Promise<NutritionHistoryResponse> => {
  const { data } = await api.get("/nutrition/me/history", {
    params: { days },
  });
  return data.data;
};

export const searchFoods = async (params: {
  search?: string;
  category?: string;
  excludeAllergens?: string[];
  page?: number;
  limit?: number;
}): Promise<{ foods: FoodItem[]; total: number; totalPages: number }> => {
  const { data } = await api.get("/nutrition/foods", {
    params: {
      search: params.search,
      category: params.category,
      excludeAllergens: params.excludeAllergens?.join(","),
      page: params.page,
      limit: params.limit,
    },
  });
  return {
    foods: data.data.foods,
    total: data.results,
    totalPages: data.totalPages,
  };
};

export const getFoodCategories = async (): Promise<string[]> => {
  const { data } = await api.get("/nutrition/foods/categories");
  return data.data.categories;
};

export const getFoodById = async (id: string): Promise<FoodItem> => {
  const { data } = await api.get(`/nutrition/foods/${id}`);
  return data.data.food;
};

export const createCustomFood = async (
  payload: CreateCustomFoodPayload,
): Promise<FoodItem> => {
  const { data } = await api.post("/nutrition/me/custom-foods", payload);
  return data.data.food;
};

export const getUserCustomFoods = async (): Promise<FoodItem[]> => {
  const { data } = await api.get("/nutrition/me/custom-foods");
  return data.data.foods;
};

export const updateCustomFood = async (
  foodId: string,
  payload: UpdateCustomFoodPayload,
): Promise<FoodItem> => {
  const { data } = await api.patch(
    `/nutrition/me/custom-foods/${foodId}`,
    payload,
  );
  return data.data.food;
};

export const deleteCustomFood = async (
  foodId: string,
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/nutrition/me/custom-foods/${foodId}`);
  return data;
};

// ==========================================
// COACH API CALLS
// ==========================================

export const getCoachEligibleMembers = async (): Promise<
  CoachEligibleMember[]
> => {
  const { data } = await api.get("/nutrition/coach/eligible-members");
  return data.data.members;
};

export const getCoachMemberNutrition = async (
  memberId: string,
  date?: string,
): Promise<CoachMemberNutritionView> => {
  const { data } = await api.get(`/nutrition/coach/members/${memberId}`, {
    params: date ? { date } : undefined,
  });
  return data.data;
};

export const createCoachPlan = async (
  payload: CreateCoachPlanPayload,
): Promise<{ plan: NutritionPlan }> => {
  const { data } = await api.post("/nutrition/coach/plans", payload);
  return data.data;
};
