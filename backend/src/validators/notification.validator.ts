import z from "zod";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

const notificationTypeValues = Object.values(NOTIFICATION_TYPE) as [
  string,
  ...string[],
];

export const createNotificationSchema = z.object({
  body: z.object({
    user: z.string().trim(),
    title: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(500),
    type: z.enum(notificationTypeValues),
    actionUrl: z.string().trim().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().trim(),
  }),
});

export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    workoutNotifications: z.boolean().optional(),
    nutritionNotifications: z.boolean().optional(),
    coachingNotifications: z.boolean().optional(),
    achievementNotifications: z.boolean().optional(),
    reminderNotifications: z.boolean().optional(),
  }),
});
