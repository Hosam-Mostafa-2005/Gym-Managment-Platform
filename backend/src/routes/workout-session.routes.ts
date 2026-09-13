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

// Member فقط يبدأ Session
router.post(
  "/start",
  restrictTo(Roles.MEMBER),
  validate(startWorkoutSessionSchema),
  workoutSessionController.start,
);

// Member فقط ينهي Session
router.patch(
  "/:id/finish",
  restrictTo(Roles.MEMBER),
  validate(finishWorkoutSessionSchema),
  workoutSessionController.finish,
);

// Current Session للـ Member فقط
router.get(
  "/current",
  restrictTo(Roles.MEMBER),
  workoutSessionController.getCurrent,
);

// جميع الـ Sessions
// Admin يشوف الكل
// Trainer يشوف Sessions الخاصة بالـ Assignments بتاعته
// Member يشوف Sessions الخاصة بيه
router.get(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getAll,
);

// Session معينة
// Admin أي Session
// Trainer لو Assignment بتاعه
// Member لو Session بتاعته
router.get(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutSessionController.getById,
);

export default router;
