import { Router } from "express";

import * as workoutLogController from "../controllers/workout-log.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import {
  createWorkoutLogSchema,
  updateWorkoutLogSchema,
} from "../validators/workout-log.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

/**
 * @swagger
 * /workout-logs:
 *   post:
 *     tags:
 *       - Workout Logs
 *     summary: Create workout log
 *     description: Create a workout log for the current workout session.
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
 *         description: Workout log created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/",
  restrictTo(Roles.MEMBER),
  validate(createWorkoutLogSchema),
  workoutLogController.create,
);

/**
 * @swagger
 * /workout-logs/session/{sessionId}:
 *   get:
 *     tags:
 *       - Workout Logs
 *     summary: Get workout session logs
 *     description: Retrieve all workout logs for a specific workout session.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout Session ID.
 *     responses:
 *       200:
 *         description: Workout logs retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Session not found.
 */
router.get(
  "/session/:sessionId",
  restrictTo(Roles.MEMBER),
  workoutLogController.getSessionLogs,
);

/**
 * @swagger
 * /workout-logs/{id}:
 *   patch:
 *     tags:
 *       - Workout Logs
 *     summary: Update workout log
 *     description: Update an existing workout log.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout Log ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workout log updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Workout log not found.
 */
router.patch(
  "/:id",
  restrictTo(Roles.MEMBER),
  validate(updateWorkoutLogSchema),
  workoutLogController.update,
);

/**
 * @swagger
 * /workout-logs/{id}:
 *   delete:
 *     tags:
 *       - Workout Logs
 *     summary: Delete workout log
 *     description: Soft delete a workout log.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout Log ID.
 *     responses:
 *       200:
 *         description: Workout log deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Workout log not found.
 */
router.delete("/:id", restrictTo(Roles.MEMBER), workoutLogController.remove);

export default router;
