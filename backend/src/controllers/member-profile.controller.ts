// src/controllers/member-profile.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import memberProfileService from "../services/member-profile.service.js";

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
