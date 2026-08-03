import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";

import workoutSetService from "../services/workout-set.service.js";

export const create: RequestHandler = catchAsync(async (req, res) => {
  const setLog = await workoutSetService.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      setLog,
    },
  });
});
