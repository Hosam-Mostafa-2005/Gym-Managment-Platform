import { Router } from "express";

import * as workoutSessionController from "../controllers/workout-session.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import {
  startWorkoutSessionSchema,
  finishWorkoutSessionSchema,
} from "../validators/workout-session.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /workout-sessions/start:
 *   post:
 *     tags:
 *       - Workout Sessions
 *     summary: Start workout session
 *     description: Start a new workout session for the authenticated member.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Workout session started successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/start",
  restrictTo(Roles.MEMBER),
  validate(startWorkoutSessionSchema),
  workoutSessionController.start,
);

/**
 * @swagger
 * /workout-sessions/{id}/finish:
 *   patch:
 *     tags:
 *       - Workout Sessions
 *     summary: Finish workout session
 *     description: Finish the current workout session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout Session ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workout session finished successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Workout session not found.
 */
router.patch(
  "/:id/finish",
  restrictTo(Roles.MEMBER),
  validate(finishWorkoutSessionSchema),
  workoutSessionController.finish,
);

/**
 * @swagger
 * /workout-sessions/me:
 *   get:
 *     tags:
 *       - Workout Sessions
 *     summary: Get my workout sessions
 *     description: Retrieve all workout sessions for the authenticated member.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout sessions retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/me",
  restrictTo(Roles.MEMBER),
  workoutSessionController.getMySessions,
);

router.get(
  "/current",
  restrictTo(Roles.MEMBER),
  workoutSessionController.getCurrent,
);

/**
 * @swagger
 * /workout-sessions/{id}:
 *   get:
 *     tags:
 *       - Workout Sessions
 *     summary: Get workout session by ID
 *     description: Retrieve a specific workout session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout Session ID.
 *     responses:
 *       200:
 *         description: Workout session retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Workout session not found.
 */
router.get("/:id", restrictTo(Roles.MEMBER), workoutSessionController.getById);

export default router;
