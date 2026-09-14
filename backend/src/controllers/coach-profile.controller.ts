// src/controllers/coach-profile.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import coachProfileService from "../services/coach-profile.service.js";

export const getProfile: RequestHandler = catchAsync(async (req, res) => {
  const profile = await coachProfileService.getProfile(
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: profile,
  });
});

export const updateProfile: RequestHandler = catchAsync(async (req, res) => {
  const profile = await coachProfileService.updateProfile(
    req.user!.id,
    req.user!.role,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: profile,
  });
});
