import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import workoutLogService from "../services/workout-log.service.js";

export const create: RequestHandler = catchAsync(async (req, res) => {
  const log = await workoutLogService.create(req.body, req.user!.id);

  res.status(201).json({
    status: "success",
    data: {
      log,
    },
  });
});

export const getSessionLogs: RequestHandler = catchAsync(async (req, res) => {
  const logs = await workoutLogService.getSessionLogs(
    req.params.sessionId as string,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    results: logs.length,
    data: {
      logs,
    },
  });
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const log = await workoutLogService.update(
    req.params.id as string,
    req.body,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    data: {
      log,
    },
  });
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  await workoutLogService.delete(req.params.id as string, req.user!.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
