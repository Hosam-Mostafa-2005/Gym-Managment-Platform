import { Router } from "express";

import * as workoutController from "../controllers/workout.controller.js";
import * as workoutShareController from "../controllers/workout-share.controller.js";

import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { ownsWorkout } from "../middleware/workoutOwnership.middleware.js";

import {
  createWorkoutSchema,
  updateWorkoutSchema,
} from "../validators/workout.validator.js";

import { Roles } from "../constants/roles.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public / Unauthenticated Share Preview
|--------------------------------------------------------------------------
*/
router.get("/share/preview", workoutShareController.getSharePreview);
router.get("/share/preview/:identifier", workoutShareController.getSharePreview);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Share Actions (Create, Import, Revoke)
|--------------------------------------------------------------------------
*/
router.post("/:id/share", workoutShareController.createShare);
router.get("/:id/shares", workoutShareController.getWorkoutShares);
router.post("/share/import", workoutShareController.importSharedWorkout);
router.delete("/share/:id", workoutShareController.revokeShare);

/*
|--------------------------------------------------------------------------
| Read
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutController.getAll,
);

router.get("/:id", workoutController.getById);

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  validate(createWorkoutSchema),
  workoutController.create,
);

router.post(
  "/:id/duplicate",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  workoutController.duplicate,
);

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  ownsWorkout,
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
  restrictTo(Roles.ADMIN, Roles.TRAINER, Roles.MEMBER),
  ownsWorkout,
  workoutController.remove,
);

export default router;
