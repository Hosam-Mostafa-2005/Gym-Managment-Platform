// src/routes/member-insights.routes.ts
import { Router } from "express";
import * as memberInsightsController from "../controllers/member-insights.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Protect all routes
router.use(protect);

// Only Admins and Trainers can access insights.
// Service layer ensures Trainers only access assigned members.
router
  .route("/:memberId")
  .get(
    restrictTo(Roles.ADMIN, Roles.TRAINER),
    memberInsightsController.getMemberInsights,
  );

export default router;
