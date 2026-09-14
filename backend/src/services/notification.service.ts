import Notification from "../models/Notification.model.js";

import AppError from "../utils/AppError.js";
import mapNotification from "../mappers/notification.mapper.js";

import type { CreateNotificationDto } from "../types/notification.types.js";

import { getIO } from "../socket/index.js";

class NotificationService {
  async create(data: CreateNotificationDto) {
    const notification = await Notification.create(data);

    const mappedNotification = mapNotification(notification);

    const unreadCount = await Notification.countDocuments({
      user: data.user,
      isActive: true,
      readAt: null,
    });

    const io = getIO();

    io.to(`user:${data.user.toString()}`).emit("notification", {
      notification: mappedNotification,
      unreadCount,
    });

    return mappedNotification;
  }

  async getMyNotifications(userId: string) {
    const notifications = await Notification.find({
      user: userId,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isActive: true,
      readAt: null,
    });

    return {
      notifications: notifications.map(mapNotification),
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await Notification.findOne({
      _id: id,
      user: userId,
      isActive: true,
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    return mapNotification(notification);
  }

  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      {
        user: userId,
        isActive: true,
        readAt: null,
      },
      {
        readAt: new Date(),
      },
    );

    return;
  }

  async delete(id: string, userId: string) {
    const notification = await Notification.findOne({
      _id: id,
      user: userId,
      isActive: true,
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    notification.isActive = false;

    await notification.save();

    return;
  }
}

export default new NotificationService();
