import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";

import workoutExerciseLogService from "../services/workout-exercise-log.service.js";

export const getBySession: RequestHandler = catchAsync(async (req, res) => {
  const exercises = await workoutExerciseLogService.getBySession(
    req.params.sessionId as string,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    results: exercises.length,
    data: {
      exercises,
    },
  });
});
