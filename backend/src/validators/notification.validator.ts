import z from "zod";

import { NOTIFICATION_TYPE } from "../constants/notification.js";

export const createNotificationSchema = z.object({
  body: z.object({
    user: z.string().trim(),

    title: z.string().trim().min(1).max(100),

    message: z.string().trim().min(1).max(500),

    type: z.enum(NOTIFICATION_TYPE),

    actionUrl: z.string().trim().optional(),

    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().trim(),
  }),
});
