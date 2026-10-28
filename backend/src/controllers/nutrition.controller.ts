// src/controllers/nutrition.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import { nutritionService } from "../services/nutrition.service.js";
import { foodCatalogService } from "../services/food-catalog.service.js";
import { Roles } from "../constants/roles.js";

// ==========================================
// MEMBER ENDPOINTS
// ==========================================

export const getMemberOverview: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;
  const date = req.query.date as string | undefined;

  const overview = await nutritionService.getMemberOverview(memberId, date);

  res.status(200).json({
    status: "success",
    data: overview,
  });
});

export const getMemberProfile: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;

  const profileData = await nutritionService.getMemberProfile(memberId);

  res.status(200).json({
    status: "success",
    data: profileData,
  });
});

export const completeOnboarding: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;

  const result = await nutritionService.completeOnboarding(memberId, req.body);

  res.status(200).json({
    status: "success",
    message: "Nutrition assessment completed and plan generated.",
    data: result,
  });
});

export const logFood: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;

  const log = await nutritionService.logFood(memberId, req.body);

  res.status(201).json({
    status: "success",
    message: "Food logged successfully.",
    data: { log },
  });
});

export const updateFoodLog: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;
  const logId = req.params.id as string;

  const updatedLog = await nutritionService.updateFoodLog(
    logId,
    memberId,
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Food log updated successfully.",
    data: { log: updatedLog },
  });
});

export const deleteFoodLog: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;
  const logId = req.params.id as string;

  const result = await nutritionService.deleteFoodLog(logId, memberId);

  res.status(200).json({
    status: "success",
    message: result.message,
  });
});

export const getNutritionHistory: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.user!.id;
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;

  const history = await nutritionService.getNutritionHistory(memberId, days);

  res.status(200).json({
    status: "success",
    data: history,
  });
});

// ==========================================
// FOOD CATALOG ENDPOINTS (SHARED)
// ==========================================

export const searchFoods: RequestHandler = catchAsync(async (req, res) => {
  const { search, category, excludeAllergens, page, limit } = req.query;

  const parsedAllergens = excludeAllergens
    ? (Array.isArray(excludeAllergens)
        ? excludeAllergens
        : (excludeAllergens as string).split(",")
      ).map((s) => (s as string).trim())
    : undefined;

  const result = await foodCatalogService.searchFoods({
    search: search as string | undefined,
    category: category as string | undefined,
    allergensToExclude: parsedAllergens,
    userId: req.user?.id,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  res.status(200).json({
    status: "success",
    results: result.total,
    page: result.page,
    totalPages: result.totalPages,
    data: {
      foods: result.foods,
    },
  });
});

export const getFoodCategories: RequestHandler = catchAsync(async (_req, res) => {
  const categories = await foodCatalogService.getCategories();

  res.status(200).json({
    status: "success",
    data: { categories },
  });
});

export const getFoodById: RequestHandler = catchAsync(async (req, res) => {
  const food = await foodCatalogService.getFoodById(
    req.params.id as string,
    req.user?.id,
  );

  res.status(200).json({
    status: "success",
    data: { food },
  });
});

export const createCustomFood: RequestHandler = catchAsync(async (req, res) => {
  const food = await foodCatalogService.createCustomFood(
    req.user!.id,
    req.body,
  );

  res.status(201).json({
    status: "success",
    message: "Custom food created successfully.",
    data: { food },
  });
});

export const getUserCustomFoods: RequestHandler = catchAsync(async (req, res) => {
  const foods = await foodCatalogService.getUserCustomFoods(req.user!.id);

  res.status(200).json({
    status: "success",
    results: foods.length,
    data: { foods },
  });
});

export const updateCustomFood: RequestHandler = catchAsync(async (req, res) => {
  const food = await foodCatalogService.updateCustomFood(
    req.user!.id,
    req.params.id as string,
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "Custom food updated successfully.",
    data: { food },
  });
});

export const deleteCustomFood: RequestHandler = catchAsync(async (req, res) => {
  const result = await foodCatalogService.deleteCustomFood(
    req.user!.id,
    req.params.id as string,
  );

  res.status(200).json({
    status: "success",
    ...result,
  });
});

// ==========================================
// COACH ENDPOINTS
// ==========================================

export const getCoachEligibleMembers: RequestHandler = catchAsync(async (req, res) => {
  const coachId = req.user!.id;
  const isAdmin = req.user!.role === Roles.ADMIN;

  const members = await nutritionService.getCoachEligibleMembers(coachId, isAdmin);

  res.status(200).json({
    status: "success",
    results: members.length,
    data: { members },
  });
});

export const getMemberNutritionForCoach: RequestHandler = catchAsync(async (req, res) => {
  const coachId = req.user!.id;
  const memberId = req.params.memberId as string;
  const isAdmin = req.user!.role === Roles.ADMIN;
  const date = req.query.date as string | undefined;

  // Authorization check enforced inside service
  await nutritionService.verifyCoachAuthorization(coachId, memberId, isAdmin);

  const [overview, history, profileData] = await Promise.all([
    nutritionService.getMemberOverview(memberId, date),
    nutritionService.getNutritionHistory(memberId, 30),
    nutritionService.getMemberProfile(memberId),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      overview,
      history,
      profile: profileData.profile,
      user: profileData.user,
      suggestedMeasurement: profileData.suggestedMeasurement,
    },
  });
});

export const createCoachPlan: RequestHandler = catchAsync(async (req, res) => {
  const coachId = req.user!.id;
  const isAdmin = req.user!.role === Roles.ADMIN;
  const { memberId, ...planData } = req.body;

  const plan = await nutritionService.createCoachPlan(
    coachId,
    memberId,
    planData,
    isAdmin,
  );

  res.status(201).json({
    status: "success",
    message: "Nutrition plan assigned successfully.",
    data: { plan },
  });
});
