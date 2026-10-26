// src/controllers/member-profile.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import memberProfileService from "../services/member-profile.service.js";
import authService from "../services/auth.service.js";
import AppError from "../utils/AppError.js";
import { Roles } from "../constants/roles.js";

export const getMemberProfile: RequestHandler = catchAsync(async (req, res) => {
  const memberId = req.params.memberId as string;

  const profile = await memberProfileService.getProfile(
    memberId,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: profile,
  });
});

export const updateMemberProfile: RequestHandler = catchAsync(
  async (req, res) => {
    const memberId = req.params.memberId as string;

    if (req.user!.role === Roles.MEMBER && req.user!.id !== memberId) {
      throw new AppError("You can only update your own profile.", 403);
    }

    const updatedUser = await authService.updateProfile(memberId, req.body);

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  },
);
