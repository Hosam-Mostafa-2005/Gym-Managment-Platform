import { Router } from "express";

import * as bodyMeasurementController from "../controllers/body-measurement.controller.js";

import { protect, restrictTo } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { Roles } from "../constants/roles.js";

import {
  createBodyMeasurementSchema,
  updateBodyMeasurementSchema,
} from "../validators/body-measurement.validator.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  (req, res, next) => {
    console.log("🔥 REQUEST BODY:", JSON.stringify(req.body, null, 2));
    next();
  },
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createBodyMeasurementSchema),
  bodyMeasurementController.createBodyMeasurement,
);

router.get(
  "/member/:memberId",
  bodyMeasurementController.getMemberMeasurements,
);

router.get(
  "/member/:memberId/latest",
  bodyMeasurementController.getLatestMemberMeasurement,
);

router.get("/:id", bodyMeasurementController.getBodyMeasurementById);

router.patch(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(updateBodyMeasurementSchema),
  bodyMeasurementController.updateBodyMeasurement,
);

router.delete(
  "/:id",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  bodyMeasurementController.deleteBodyMeasurement,
);
console.log("🔥 BODY MEASUREMENT ROUTES LOADED");
export default router;
