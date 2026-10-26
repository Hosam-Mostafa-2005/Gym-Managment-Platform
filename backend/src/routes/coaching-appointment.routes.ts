// src/routes/coaching-appointment.routes.ts
import { Router } from "express";
import * as coachingAppointmentController from "../controllers/coaching-appointment.controller.js";
import validate from "../middleware/validate.middleware.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  completeAppointmentSchema,
} from "../validators/coaching-appointment.validator.js";
import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

// ==========================================
// COACH ROUTES
// ==========================================
router.get(
  "/coach/agenda",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  coachingAppointmentController.getCoachAgenda,
);

router.get(
  "/coach",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  coachingAppointmentController.getCoachAppointments,
);

router.post(
  "/coach",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(createAppointmentSchema),
  coachingAppointmentController.createAppointment,
);

router.patch(
  "/coach/:id/complete",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  validate(completeAppointmentSchema),
  coachingAppointmentController.completeAppointment,
);

router.patch(
  "/coach/:id/no-show",
  restrictTo(Roles.ADMIN, Roles.TRAINER),
  coachingAppointmentController.markNoShow,
);

// ==========================================
// MEMBER ROUTES
// ==========================================
router.get(
  "/me",
  restrictTo(Roles.MEMBER),
  coachingAppointmentController.getMemberAppointments,
);

// ==========================================
// SHARED / GENERAL ROUTES
// ==========================================
router.get(
  "/:id",
  coachingAppointmentController.getAppointmentById,
);

router.patch(
  "/:id",
  validate(updateAppointmentSchema),
  coachingAppointmentController.updateAppointment,
);

router.patch(
  "/:id/cancel",
  validate(cancelAppointmentSchema),
  coachingAppointmentController.cancelAppointment,
);

router.delete(
  "/:id",
  validate(cancelAppointmentSchema),
  coachingAppointmentController.cancelAppointment,
);

export default router;
