import { Router } from "express";

import * as dashboardController from "../controllers/dashboard.controller.js";

import { protect, restrictTo } from "../middleware/auth.middleware.js";

import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /dashboard/trainer:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get trainer dashboard
 *     description: Returns dashboard statistics for Admins and Trainers.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
  "/trainer",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  dashboardController.getTrainerDashboard,
);

/**
 * @swagger
 * /dashboard/member:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get member dashboard
 *     description: Returns dashboard statistics for the authenticated member.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
  "/member",
  restrictTo(Roles.MEMBER),
  dashboardController.getMemberDashboard,
);

export default router;
