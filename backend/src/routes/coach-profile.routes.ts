// src/routes/coach-profile.routes.ts
import { Router } from "express";
import * as coachProfileController from "../controllers/coach-profile.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .get(
    restrictTo(Roles.ADMIN, Roles.TRAINER),
    coachProfileController.getProfile,
  )
  .patch(
    restrictTo(Roles.ADMIN, Roles.TRAINER),
    coachProfileController.updateProfile,
  );

export default router;
