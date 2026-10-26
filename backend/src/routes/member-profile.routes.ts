// src/routes/member-profile.routes.ts
import { Router } from "express";
import * as memberProfileController from "../controllers/member-profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validators/auth.validator.js";

const router = Router();

// Protect all routes
router.use(protect);

// Role restriction is handled at the service/controller level
router
  .route("/:memberId")
  .get(memberProfileController.getMemberProfile)
  .patch(
    validate(updateProfileSchema),
    memberProfileController.updateMemberProfile,
  );

export default router;
