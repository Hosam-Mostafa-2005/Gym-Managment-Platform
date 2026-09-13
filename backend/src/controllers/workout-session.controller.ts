import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import workoutSessionService from "../services/workout-session.service.js";

export const start: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.start(
    req.user!.id,
    req.body.assignment,
  );

  res.status(201).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const getCurrent: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.getCurrent(req.user!.id);

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const finish: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.finish(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const getAll: RequestHandler = catchAsync(async (req, res) => {
  const sessions = await workoutSessionService.getAll(
    req.query,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    results: sessions.length,
    data: {
      sessions,
    },
  });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.getById(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});
