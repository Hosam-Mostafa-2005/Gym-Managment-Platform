import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import workoutService from "../services/workout.service.js";

export const create: RequestHandler = catchAsync(async (req, res) => {
  const workout = await workoutService.create(req.body, req.user!.id);

  res.status(201).json({
    status: "success",
    data: {
      workout,
    },
  });
});

export const getAll: RequestHandler = catchAsync(async (req, res) => {
  const workouts = await workoutService.getAll(
    req.query,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    results: workouts.length,
    data: {
      workouts,
    },
  });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const workout = await workoutService.getById(req.params.id as string);

  res.status(200).json({
    status: "success",
    data: {
      workout,
    },
  });
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const workout = await workoutService.update(
    req.params.id as string,
    req.body,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: {
      workout,
    },
  });
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  await workoutService.delete(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
  );
  res.status(204).json({
    status: "success",
    data: null,
  });
});
