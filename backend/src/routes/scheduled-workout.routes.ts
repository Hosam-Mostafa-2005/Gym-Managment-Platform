import { Router } from "express";
import * as scheduledWorkoutController from "../controllers/scheduled-workout.controller.js";
import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  createScheduledWorkoutSchema,
  updateScheduledWorkoutSchema,
  createCoachScheduledWorkoutSchema,
  updateCoachScheduledWorkoutSchema,
} from "../validators/scheduled-workout.validator.js";
import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

// ==========================================
// COACH ROUTES
// ==========================================
router.get(
  "/coach",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  scheduledWorkoutController.getCoachScheduledWorkouts,
);

router.post(
  "/coach",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createCoachScheduledWorkoutSchema),
  scheduledWorkoutController.createCoachScheduled,
);

router.patch(
  "/coach/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateCoachScheduledWorkoutSchema),
  scheduledWorkoutController.updateCoachScheduled,
);

router.delete(
  "/coach/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  scheduledWorkoutController.cancelCoachScheduled,
);

// ==========================================
// MEMBER ROUTES
// ==========================================
router.get(
  "/summary",
  restrictTo(Roles.MEMBER),
  scheduledWorkoutController.getSummary,
);

router.post(
  "/",
  restrictTo(Roles.MEMBER),
  validate(createScheduledWorkoutSchema),
  scheduledWorkoutController.create,
);

router.get(
  "/",
  restrictTo(Roles.MEMBER),
  scheduledWorkoutController.getAll,
);

router.get(
  "/:id",
  scheduledWorkoutController.getById,
);

router.patch(
  "/:id",
  restrictTo(Roles.MEMBER),
  validate(updateScheduledWorkoutSchema),
  scheduledWorkoutController.update,
);

router.delete(
  "/:id",
  restrictTo(Roles.MEMBER),
  scheduledWorkoutController.cancel,
);

router.patch(
  "/:id/cancel",
  restrictTo(Roles.MEMBER),
  scheduledWorkoutController.cancel,
);

router.post(
  "/:id/start",
  restrictTo(Roles.MEMBER),
  scheduledWorkoutController.start,
);

export default router;
