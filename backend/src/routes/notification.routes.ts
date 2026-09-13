import { Router } from "express";

import * as notificationController from "../controllers/notification.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { markAsReadSchema } from "../validators/notification.validator.js";

const router = Router();

router.use(protect);

router.get("/", notificationController.getMyNotifications);

router.patch("/read-all", notificationController.markAllAsRead);

router.patch(
  "/:id/read",
  validate(markAsReadSchema),
  notificationController.markAsRead,
);

router.delete(
  "/:id",
  validate(markAsReadSchema),
  notificationController.deleteNotification,
);

export default router;
