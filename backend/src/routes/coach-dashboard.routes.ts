// src/routes/coach-dashboard.routes.ts
import { Router } from "express";
import * as coachDashboardController from "../controllers/coach-dashboard.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Protect all routes
router.use(protect);

// Only Admins and Trainers can access the dashboard.
// Service layer ensures Trainers only see data for their assigned members.
router
  .route("/")
  .get(
    restrictTo(Roles.ADMIN, Roles.TRAINER),
    coachDashboardController.getDashboard,
  );

export default router;
