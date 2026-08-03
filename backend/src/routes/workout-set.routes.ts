import { Router } from "express";

import * as workoutSetController from "../controllers/workout-set.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import { Roles } from "../constants/roles.js";

import { createWorkoutSetSchema } from "../validators/workout-set.validator.js";

const router = Router();

router.post(
  "/",
  protect,
  restrictTo(Roles.MEMBER),
  validate(createWorkoutSetSchema),
  workoutSetController.create,
);

export default router;
