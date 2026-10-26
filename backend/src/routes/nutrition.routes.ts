import { Router } from "express";
import * as nutritionController from "../controllers/nutrition.controller.js";
import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";
import {
  onboardingSchema,
  logFoodSchema,
  updateFoodLogSchema,
  createCoachPlanSchema,
} from "../validators/nutrition.validator.js";

const router = Router();

// All nutrition routes require authentication
router.use(protect);

// ==========================================
// FOOD CATALOG ROUTES (SHARED)
// ==========================================
router.get("/foods", nutritionController.searchFoods);
router.get("/foods/categories", nutritionController.getFoodCategories);
router.get("/foods/:id", nutritionController.getFoodById);

// ==========================================
// MEMBER ROUTES
// ==========================================
router.get(
  "/me/overview",
  restrictTo(Roles.MEMBER),
  nutritionController.getMemberOverview,
);

router.get(
  "/me/profile",
  restrictTo(Roles.MEMBER),
  nutritionController.getMemberProfile,
);

router.post(
  "/me/onboard",
  restrictTo(Roles.MEMBER),
  validate(onboardingSchema),
  nutritionController.completeOnboarding,
);

router.post(
  "/me/logs",
  restrictTo(Roles.MEMBER),
  validate(logFoodSchema),
  nutritionController.logFood,
);

router.patch(
  "/me/logs/:id",
  restrictTo(Roles.MEMBER),
  validate(updateFoodLogSchema),
  nutritionController.updateFoodLog,
);

router.delete(
  "/me/logs/:id",
  restrictTo(Roles.MEMBER),
  nutritionController.deleteFoodLog,
);

router.get(
  "/me/history",
  restrictTo(Roles.MEMBER),
  nutritionController.getNutritionHistory,
);

// ==========================================
// COACH ROUTES
// ==========================================
router.get(
  "/coach/eligible-members",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  nutritionController.getCoachEligibleMembers,
);

router.get(
  "/coach/members/:memberId",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  nutritionController.getMemberNutritionForCoach,
);

router.post(
  "/coach/plans",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createCoachPlanSchema),
  nutritionController.createCoachPlan,
);

export default router;
