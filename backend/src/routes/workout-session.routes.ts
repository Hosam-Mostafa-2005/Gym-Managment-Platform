import { Router } from "express";

import * as workoutSessionController from "../controllers/workout-session.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import {
  startWorkoutSessionSchema,
  finishWorkoutSessionSchema,
  reviewWorkoutSessionSchema,
  swapExerciseLogSchema,
} from "../validators/workout-session.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

// Start Session
router.post(
  "/start",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  validate(startWorkoutSessionSchema),
  workoutSessionController.start,
);

// Finish Session
router.patch(
  "/:id/finish",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  validate(finishWorkoutSessionSchema),
  workoutSessionController.finish,
);

// Cancel Session
router.patch(
  "/:id/cancel",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.cancel,
);

// Review Session (Coach / Admin)
router.patch(
  "/:id/review",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(reviewWorkoutSessionSchema),
  workoutSessionController.review,
);

// Swap Exercise (Member / Admin)
router.patch(
  "/:id/exercises/:exerciseLogId/swap",
  restrictTo(Roles.ADMIN, Roles.MEMBER),
  validate(swapExerciseLogSchema),
  workoutSessionController.swapExercise,
);

// Current Session
router.get(
  "/current",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getCurrent,
);

// Previous Performance batch by exerciseIds
router.post(
  "/previous-performance",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getPreviousPerformanceBatch,
);

// Previous Performance for specific session
router.get(
  "/:id/previous-performance",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getPreviousPerformance,
);

// All Sessions
router.get(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getAll,
);

// Specific Session
router.get(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getById,
);

export default router;
