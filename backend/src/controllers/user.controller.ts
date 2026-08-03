import type { RequestHandler } from "express";
import userService from "../services/user.service.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const users = await userService.getAll(req.query);

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users, // ببعت الـ array مباشر جوه data عشان واجهة الفرونت تلقطها فوراً
  });
});
