import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { uploadAvatarMiddleware } from "../middleware/upload.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { assignRoleSchema } from "../validators/auth.validator.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Profile Avatar management for all authenticated users (Member, Trainer, Admin)
router.post(
  "/me/avatar",
  protect,
  uploadAvatarMiddleware,
  userController.uploadAvatar,
);
router.delete("/me/avatar", protect, userController.deleteAvatar);

// Coach & Admin user discovery
router.use(protect, restrictTo(Roles.ADMIN, Roles.TRAINER));

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users (with optional filters like ?role=TRAINER)
 *     security:
 *       - bearerAuth: []
 */
router.route("/").get(userController.getAllUsers);

// Administrator role assignment route
router.patch(
  "/:id/role",
  restrictTo(Roles.ADMIN),
  validate(assignRoleSchema),
  userController.assignUserRole,
);

export default router;
