import { Router } from "express";

import * as workoutController from "../controllers/workout.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import {
  createWorkoutSchema,
  updateWorkoutSchema,
} from "../validators/workout.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

/**
 * @swagger
 * /workouts:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get all workouts
 *     description: Retrieve all active workouts.
 *     responses:
 *       200:
 *         description: Workouts retrieved successfully.
 */
router.get("/", workoutController.getAll);

/**
 * @swagger
 * /workouts/{id}:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get workout by ID
 *     description: Retrieve a specific workout.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID.
 *     responses:
 *       200:
 *         description: Workout retrieved successfully.
 *       404:
 *         description: Workout not found.
 */
router.get("/:id", workoutController.getById);

router.use(protect);

/**
 * @swagger
 * /workouts:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Create workout
 *     description: Create a new workout.
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
 *         description: Workout created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createWorkoutSchema),
  workoutController.create,
);

/**
 * @swagger
 * /workouts/{id}:
 *   patch:
 *     tags:
 *       - Workouts
 *     summary: Update workout
 *     description: Update an existing workout.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Workout updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Workout not found.
 */
router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateWorkoutSchema),
  workoutController.update,
);

/**
 * @swagger
 * /workouts/{id}:
 *   delete:
 *     tags:
 *       - Workouts
 *     summary: Delete workout
 *     description: Soft delete a workout.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID.
 *     responses:
 *       200:
 *         description: Workout deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Workout not found.
 */
router.delete("/:id", restrictTo(Roles.ADMIN), workoutController.remove);

export default router;
