import { Router } from "express";

import * as assignmentController from "../controllers/assignment.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import {
  createAssignmentSchema,
  updateAssignmentSchema,
} from "../validators/assignment.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

/**
 * @swagger
 * /assignments:
 *   get:
 *     tags:
 *       - Assignments
 *     summary: Get all assignments
 *     description: Retrieve all active assignments.
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully.
 */
router.get("/", assignmentController.getAll);

router.use(protect);

/**
 * @swagger
 * /assignments/me:
 *   get:
 *     tags:
 *       - Assignments
 *     summary: Get my assignments
 *     description: Returns all assignments for the authenticated member.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
  "/me",
  restrictTo(Roles.MEMBER),
  assignmentController.getMyAssignments,
);

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     tags:
 *       - Assignments
 *     summary: Get assignment by ID
 *     description: Retrieve a specific assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID.
 *     responses:
 *       200:
 *         description: Assignment retrieved successfully.
 *       404:
 *         description: Assignment not found.
 */
router.get("/:id", assignmentController.getById);
/**
 * @swagger
 * /assignments:
 *   post:
 *     tags:
 *       - Assignments
 *     summary: Create assignment
 *     description: Create a new workout assignment for a member.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member
 *               - workout
 *               - startDate
 *               - endDate
 *             properties:
 *               member:
 *                 type: string
 *                 description: Member ID
 *                 example: 6868b1a4b5d0e2c123456789
 *               workout:
 *                 type: string
 *                 description: Workout ID
 *                 example: 6868b1a4b5d0e2c987654321
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-01T00:00:00.000Z"
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - COMPLETED
 *                   - CANCELLED
 *                 example: ACTIVE
 *               notes:
 *                 type: string
 *                 example: Focus on progressive overload.
 *     responses:
 *       201:
 *         description: Assignment created successfully.
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
  validate(createAssignmentSchema),
  assignmentController.create,
);

/**
 * @swagger
 * /assignments/{id}:
 *   patch:
 *     tags:
 *       - Assignments
 *     summary: Update assignment
 *     description: Update an existing assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               member:
 *                 type: string
 *                 example: 6868b1a4b5d0e2c123456789
 *               workout:
 *                 type: string
 *                 example: 6868b1a4b5d0e2c987654321
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-01T00:00:00.000Z"
 *               status:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - COMPLETED
 *                   - CANCELLED
 *               notes:
 *                 type: string
 *                 example: Increase weight next week.
 *     responses:
 *       200:
 *         description: Assignment updated successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Assignment not found.
 */
router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateAssignmentSchema),
  assignmentController.update,
);

/**
 * @swagger
 * /assignments/{id}:
 *   delete:
 *     tags:
 *       - Assignments
 *     summary: Delete assignment
 *     description: Soft delete an assignment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID.
 *     responses:
 *       200:
 *         description: Assignment deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Assignment not found.
 */
router.delete("/:id", restrictTo(Roles.ADMIN), assignmentController.remove);

export default router;
