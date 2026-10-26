// src/routes/gamification.routes.ts
import { Router } from "express";
import * as gamificationController from "../controllers/gamification.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { sendEncouragementSchema } from "../validators/gamification.validator.js";
import { Roles } from "../constants/roles.js";

const router = Router();

router.use(protect);

router.get("/me", gamificationController.getMyGamification);

router.get(
  "/members/:memberId",
  restrictTo(Roles.TRAINER, Roles.ADMIN),
  gamificationController.getMemberGamification,
);

router.post(
  "/members/:memberId/encourage",
  restrictTo(Roles.TRAINER, Roles.ADMIN),
  validate(sendEncouragementSchema),
  gamificationController.sendEncouragement,
);

export default router;
