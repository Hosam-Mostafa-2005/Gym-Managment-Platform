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

// All assignment routes require authentication
router.use(protect);

// Member
router.get(
  "/me",
  restrictTo(Roles.MEMBER),
  assignmentController.getMyAssignments,
);

// Admin & Trainer
router.get(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  assignmentController.getAll,
);

router.get(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  assignmentController.getById,
);

router.post(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createAssignmentSchema),
  assignmentController.create,
);

router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateAssignmentSchema),
  assignmentController.update,
);

router.delete(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  assignmentController.remove,
);

export default router;
