import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import notificationService from "../services/notification.service.js";

export const getMyNotifications: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await notificationService.getMyNotifications(req.user!.id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

export const markAsRead: RequestHandler = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id as string,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

export const markAllAsRead: RequestHandler = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user!.id);

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read.",
  });
});

export const deleteNotification: RequestHandler = catchAsync(
  async (req, res) => {
    await notificationService.delete(req.params.id as string, req.user!.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
