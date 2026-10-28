import type { RequestHandler } from "express";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const uploadAvatar: RequestHandler = catchAsync(async (req, res) => {
  if (!req.file || !req.validatedImageInfo) {
    throw new AppError("No valid avatar image provided.", 400);
  }

  const user = await userService.updateAvatar(
    req.user!.id,
    req.file.buffer,
    req.validatedImageInfo,
    req.baseUrl,
  );

  res.status(200).json({
    status: "success",
    message: "Profile avatar updated successfully.",
    data: { user },
  });
});

export const deleteAvatar: RequestHandler = catchAsync(async (req, res) => {
  const user = await userService.deleteAvatar(req.user!.id);

  res.status(200).json({
    status: "success",
    message: "Profile avatar removed successfully.",
    data: { user },
  });
});

export const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const users = await userService.getAll(
    req.query,
    req.user?.id,
    req.user?.role,
  );

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});
