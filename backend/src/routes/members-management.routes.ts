// src/routes/members-management.routes.ts
import { Router } from "express";
import * as membersManagementController from "../controllers/members-management.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Protect all routes
router.use(protect);

// Only Admins and Trainers can access the Members Management module
router
  .route("/")
  .get(
    restrictTo(Roles.ADMIN, Roles.TRAINER),
    membersManagementController.getAllMembers,
  );

export default router;
