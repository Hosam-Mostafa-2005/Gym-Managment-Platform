import { Router } from "express";

import * as exerciseController from "../controllers/exercise.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import {
  createExerciseSchema,
  updateExerciseSchema,
} from "../validators/exercise.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

/**
 * @swagger
 * /exercises:
 *   get:
 *     tags:
 *       - Exercises
 *     summary: Get all exercises
 *     description: Retrieve all active exercises.
 *     responses:
 *       200:
 *         description: Exercises retrieved successfully.
 */
router.get("/", exerciseController.getAll);

/**
 * @swagger
 * /exercises/{id}:
 *   get:
 *     tags:
 *       - Exercises
 *     summary: Get exercise by ID
 *     description: Retrieve a specific exercise.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID.
 *     responses:
 *       200:
 *         description: Exercise retrieved successfully.
 *       404:
 *         description: Exercise not found.
 */
router.get("/:id", exerciseController.getById);

// Protected Routes
router.use(protect);

/**
 * @swagger
 * /exercises:
 *   post:
 *     tags:
 *       - Exercises
 *     summary: Create exercise
 *     description: Create a new exercise.
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
 *         description: Exercise created successfully.
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
  validate(createExerciseSchema),
  exerciseController.create,
);

/**
 * @swagger
 * /exercises/{id}:
 *   patch:
 *     tags:
 *       - Exercises
 *     summary: Update exercise
 *     description: Update an existing exercise.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Exercise updated successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Exercise not found.
 */
router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateExerciseSchema),
  exerciseController.update,
);

/**
 * @swagger
 * /exercises/{id}:
 *   delete:
 *     tags:
 *       - Exercises
 *     summary: Delete exercise
 *     description: Soft delete an exercise.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID.
 *     responses:
 *       200:
 *         description: Exercise deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Exercise not found.
 */
router.delete("/:id", restrictTo(Roles.ADMIN), exerciseController.remove);

export default router;
