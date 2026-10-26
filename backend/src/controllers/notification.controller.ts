import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import notificationService from "../services/notification.service.js";

export const getMyNotifications: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await notificationService.getMyNotifications(
      req.user!.id,
      {
        category: req.query.category as string,
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      },
    );

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

export const markAsUnread: RequestHandler = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsUnread(
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
  await notificationService.markAllAsRead(
    req.user!.id,
    req.body?.category || (req.query?.category as string),
  );

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

export const getPreferences: RequestHandler = catchAsync(async (req, res) => {
  const preferences = await notificationService.getPreferences(req.user!.id);

  res.status(200).json({
    status: "success",
    data: {
      preferences,
    },
  });
});

export const updatePreferences: RequestHandler = catchAsync(
  async (req, res) => {
    const preferences = await notificationService.updatePreferences(
      req.user!.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Notification preferences updated.",
      data: {
        preferences,
      },
    });
  },
);
