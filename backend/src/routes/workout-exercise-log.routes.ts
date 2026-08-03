import { Router } from "express";

import * as workoutExerciseLogController from "../controllers/workout-exercise-log.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

import { Roles } from "../constants/roles.js";

const router = Router();

router.get(
  "/session/:sessionId",
  protect,
  restrictTo(Roles.MEMBER),
  workoutExerciseLogController.getBySession,
);

export default router;
