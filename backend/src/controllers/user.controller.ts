import type { RequestHandler } from "express";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";

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
