import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import workoutSetService from "../services/workout-set.service.js";

export const updateWorkoutSet: RequestHandler = catchAsync(async (req, res) => {
  const result = await workoutSetService.update(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: {
      set: result,
    },
  });
});
