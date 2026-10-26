// src/services/notification.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import mapNotification from "../mappers/notification.mapper.js";
import type {
  CreateNotificationDto,
  NotificationQueryDto,
} from "../types/notification.types.js";
import {
  getCategoryForNotificationType,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_TYPE,
} from "../constants/notification.js";
import { getIO } from "../socket/index.js";

class NotificationService {
  /**
   * Create a notification with preference checks and real-time Socket.IO dispatch
   */
  async create(data: CreateNotificationDto) {
    const userId = String(data.user);
    const resolvedCategory =
      data.category || getCategoryForNotificationType(data.type);

    // 1. Check user notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (preferences) {
      if (
        resolvedCategory === NOTIFICATION_CATEGORY.WORKOUT &&
        !preferences.workoutNotifications
      ) {
        return null;
      }
      if (
        resolvedCategory === NOTIFICATION_CATEGORY.NUTRITION &&
        !preferences.nutritionNotifications
      ) {
        return null;
      }
      if (
        resolvedCategory === NOTIFICATION_CATEGORY.COACHING &&
        !preferences.coachingNotifications
      ) {
        return null;
      }
      if (
        resolvedCategory === NOTIFICATION_CATEGORY.ACHIEVEMENT &&
        !preferences.achievementNotifications
      ) {
        return null;
      }
    }

    // 2. Persist notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type as any,
        category: resolvedCategory as any,
        priority: data.priority || "NORMAL",
        actionUrl: data.actionUrl,
        metadata: (data.metadata as any) ?? {},
      },
    });

    const mappedNotification = mapNotification(notification);

    // 3. Compute current unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isActive: true,
        readAt: null,
      },
    });

    // 4. Real-time push via Socket.IO
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit("notification", {
        notification: mappedNotification,
        unreadCount,
      });
    } catch {
      // Socket not initialized or client offline
    }

    return mappedNotification;
  }

  /**
   * Get notifications with category filtering, status filtering, search, and pagination
   */
  async getMyNotifications(userId: string, query: NotificationQueryDto = {}) {
    const { category, status = "all", search, page = 1, limit = 50 } = query;

    const where: any = {
      userId,
      isActive: true,
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status === "unread") {
      where.readAt = null;
    } else if (status === "read") {
      where.readAt = { not: null };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { message: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const take = Math.min(100, Math.max(1, limit));

    const [notifications, totalCount, unreadCount, categoryGroupStats] =
      await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: {
            userId,
            isActive: true,
            readAt: null,
          },
        }),
        prisma.notification.groupBy({
          by: ["category"],
          where: {
            userId,
            isActive: true,
            readAt: null,
          },
          _count: { _all: true },
        }),
      ]);

    const categoryUnreadCounts: Record<string, number> = {
      WORKOUT: 0,
      NUTRITION: 0,
      COACHING: 0,
      ACHIEVEMENT: 0,
      SYSTEM: 0,
    };

    for (const group of categoryGroupStats) {
      if (group.category) {
        categoryUnreadCounts[group.category] = group._count._all;
      }
    }

    return {
      notifications: notifications.map(mapNotification),
      unreadCount,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / take),
      categoryUnreadCounts,
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    let updated = notification;
    if (!notification.readAt) {
      updated = await prisma.notification.update({
        where: { id },
        data: {
          readAt: new Date(),
        },
      });
    }

    return mapNotification(updated);
  }

  /**
   * Mark a single notification as unread
   */
  async markAsUnread(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        readAt: null,
      },
    });

    return mapNotification(updated);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, category?: string) {
    const where: any = {
      userId,
      isActive: true,
      readAt: null,
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    await prisma.notification.updateMany({
      where,
      data: {
        readAt: new Date(),
      },
    });

    return;
  }

  /**
   * Soft-delete a notification
   */
  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
        isActive: true,
      },
    });

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    await prisma.notification.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return;
  }

  /**
   * Get user notification preferences (or initialize defaults)
   */
  async getPreferences(userId: string) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    data: {
      workoutNotifications?: boolean;
      nutritionNotifications?: boolean;
      coachingNotifications?: boolean;
      achievementNotifications?: boolean;
      reminderNotifications?: boolean;
    },
  ) {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return preferences;
  }
}

export default new NotificationService();
