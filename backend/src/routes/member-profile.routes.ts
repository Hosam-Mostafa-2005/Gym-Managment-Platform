// src/routes/member-profile.routes.ts
import { Router } from "express";
import * as memberProfileController from "../controllers/member-profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all routes
router.use(protect);

// Role restriction is handled at the service level (Admin full access, Trainer assigned only, Member self only)
router.route("/:memberId").get(memberProfileController.getMemberProfile);

export default router;
