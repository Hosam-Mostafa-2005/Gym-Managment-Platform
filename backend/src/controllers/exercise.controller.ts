import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import exerciseService from "../services/exercise.service.js";

export const create: RequestHandler = catchAsync(async (req, res) => {
  const exercise = await exerciseService.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      exercise,
    },
  });
});

export const getAll: RequestHandler = catchAsync(async (req, res) => {
  const result = await exerciseService.getAll(req.query);

  res.status(200).json({
    status: "success",
    results: result.totalResults,
    data: {
      exercises: result.exercises,
    },
  });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const exercise = await exerciseService.getById(req.params.id as string);

  res.status(200).json({
    status: "success",
    data: {
      exercise,
    },
  });
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const exercise = await exerciseService.update(
    req.params.id as string,
    req.body,
  );
  res.status(200).json({
    status: "success",
    data: {
      exercise,
    },
  });
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  await exerciseService.delete(req.params.id as string);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
