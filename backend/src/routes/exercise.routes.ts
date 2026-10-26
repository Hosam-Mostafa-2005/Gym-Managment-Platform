import { Router } from "express";

import * as exerciseController from "../controllers/exercise.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, optionalProtect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { uploadExerciseImageMiddleware } from "../middleware/upload.middleware.js";
import { Permissions } from "../constants/permissions.js";
import {
  createExerciseSchema,
  updateExerciseSchema,
} from "../validators/exercise.validator.js";

const router = Router();

/**
 * @swagger
 * /exercises:
 *   get:
 *     tags:
 *       - Exercises
 *     summary: Get all exercises
 *     description: Retrieve all active exercises (platform + caller's custom).
 *     responses:
 *       200:
 *         description: Exercises retrieved successfully.
 */
router.get("/", optionalProtect, exerciseController.getAll);

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
router.get("/:id", optionalProtect, exerciseController.getById);

// Protected Routes
router.use(protect);

/**
 * Upload an exercise image file (multipart/form-data field "image")
 */
router.post(
  "/upload-image",
  authorize(Permissions.Exercise.CREATE),
  uploadExerciseImageMiddleware,
  exerciseController.uploadImage,
);

/**
 * Clean up an unreferenced staged exercise image
 */
router.delete(
  "/upload-image",
  authorize(Permissions.Exercise.CREATE),
  exerciseController.deleteStagedImage,
);

/**
 * @swagger
 * /exercises:
 *   post:
 *     tags:
 *       - Exercises
 *     summary: Create exercise
 *     description: Create a new exercise (platform or custom).
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
  authorize(Permissions.Exercise.CREATE),
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
  authorize(Permissions.Exercise.UPDATE),
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
router.delete(
  "/:id",
  authorize(Permissions.Exercise.DELETE),
  exerciseController.remove,
);

export default router;
