import type { RequestHandler } from "express";
import workoutShareService from "../services/workout-share.service.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

export const createShare: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { expiresAt } = req.body;
  const userId = req.user!.id;

  const result = await workoutShareService.createShare(
    id,
    userId,
    expiresAt ? new Date(expiresAt) : null,
  );

  res.status(201).json({
    status: "success",
    data: result,
  });
});

export const getSharePreview: RequestHandler = catchAsync(async (req, res) => {
  const tokenOrCode = (req.query.code || req.query.token || req.params.identifier) as string;

  if (!tokenOrCode) {
    throw new AppError("Please provide a share code or token.", 400);
  }

  const preview = await workoutShareService.getSharePreview(tokenOrCode);

  res.status(200).json({
    status: "success",
    data: preview,
  });
});

export const importSharedWorkout: RequestHandler = catchAsync(async (req, res) => {
  const { code, token, tokenOrCode } = req.body;
  const identifier = (tokenOrCode || code || token) as string;

  if (!identifier) {
    throw new AppError("Please provide a share code or token to import.", 400);
  }

  const imported = await workoutShareService.importSharedWorkout(
    identifier,
    req.user!.id,
  );

  res.status(201).json({
    status: "success",
    message: "Workout imported successfully to your routine library.",
    data: imported,
  });
});

export const revokeShare: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await workoutShareService.revokeShare(
    id,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: result,
  });
});

export const getWorkoutShares: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const shares = await workoutShareService.getWorkoutShares(id, req.user!.id);

  res.status(200).json({
    status: "success",
    results: shares.length,
    data: shares,
  });
});
