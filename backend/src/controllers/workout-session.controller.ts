import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import workoutSessionService from "../services/workout-session.service.js";

export const start: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.start(
    req.user!.id,
    req.body.assignment,
    req.body.workout,
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

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.cancel(
    req.params.id as string,
    req.user!.id,
    req.body.reason,
  );

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const review: RequestHandler = catchAsync(async (req, res) => {
  const session = await workoutSessionService.review(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const swapExercise: RequestHandler = catchAsync(async (req, res) => {
  const result = await workoutSessionService.swapExercise(
    req.params.id as string,
    req.params.exerciseLogId as string,
    req.user!.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: {
      session: result,
    },
  });
});

export const addExercise: RequestHandler = catchAsync(async (req, res) => {
  const result = await workoutSessionService.addExercise(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  res.status(201).json({
    status: "success",
    data: {
      session: result,
    },
  });
});

export const removeExercise: RequestHandler = catchAsync(async (req, res) => {
  const result = await workoutSessionService.removeExercise(
    req.params.id as string,
    req.params.exerciseLogId as string,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    data: {
      session: result,
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

export const getPreviousPerformance: RequestHandler = catchAsync(
  async (req, res) => {
    const performance =
      await workoutSessionService.getPreviousPerformanceForSession(
        req.params.id as string,
        req.user!.id,
      );

    res.status(200).json({
      status: "success",
      data: {
        previousPerformance: performance,
      },
    });
  },
);


export const getPreviousPerformanceBatch: RequestHandler = catchAsync(
  async (req, res) => {
    const { exerciseIds, excludeSessionId } = req.body;
    const performance =
      await workoutSessionService.getPreviousPerformanceForExercises(
        Array.isArray(exerciseIds) ? exerciseIds : [],
        req.user!.id,
        excludeSessionId,
      );

    res.status(200).json({
      status: "success",
      data: {
        previousPerformance: performance,
      },
    });
  },
);

