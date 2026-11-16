import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  markAsReadSchema,
  updateNotificationPreferencesSchema,
} from "../validators/notification.validator.js";

const router = Router();

router.use(protect);

router.get("/preferences", notificationController.getPreferences);
router.patch(
  "/preferences",
  validate(updateNotificationPreferencesSchema),
  notificationController.updatePreferences,
);
router.put(
  "/preferences",
  validate(updateNotificationPreferencesSchema),
  notificationController.updatePreferences,
);

router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllAsRead);

router.patch(
  "/:id/read",
  validate(markAsReadSchema),
  notificationController.markAsRead,
);

router.patch(
  "/:id/unread",
  validate(markAsReadSchema),
  notificationController.markAsUnread,
);

router.delete(
  "/:id",
  validate(markAsReadSchema),
  notificationController.deleteNotification,
);

export default router;
