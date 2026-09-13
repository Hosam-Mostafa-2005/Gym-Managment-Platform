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

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Read
|--------------------------------------------------------------------------
*/

router.get("/", workoutController.getAll);

router.get("/:id", workoutController.getById);

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createWorkoutSchema),
  workoutController.create,
);

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateWorkoutSchema),
  workoutController.update,
);

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  workoutController.remove,
);

export default router;
