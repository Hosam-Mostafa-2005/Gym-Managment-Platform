import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import exerciseService from "../services/exercise.service.js";
import AppError from "../utils/AppError.js";
import type { Role } from "../constants/roles.js";

export const uploadImage: RequestHandler = catchAsync(async (req, res) => {
  if (!req.file || !req.validatedImageInfo) {
    throw new AppError("No valid image file uploaded.", 400);
  }

  const exerciseId =
    (typeof req.body?.exerciseId === "string" && req.body.exerciseId.trim()) ||
    (typeof req.query?.exerciseId === "string" &&
      req.query.exerciseId.trim()) ||
    undefined;

  const requestBaseUrl = `${req.protocol}://${req.get("host")}`;

  const result = await exerciseService.uploadImage(
    req.file.buffer,
    req.validatedImageInfo,
    {
      exerciseId,
      userId: req.user?.id,
      role: req.user?.role as Role,
      requestBaseUrl,
    },
  );

  res.status(201).json({
    status: "success",
    data: result,
  });
});

export const deleteStagedImage: RequestHandler = catchAsync(
  async (req, res) => {
    const imageUrl =
      typeof req.body?.imageUrl === "string"
        ? req.body.imageUrl.trim()
        : undefined;

    if (!imageUrl) {
      throw new AppError("imageUrl is required.", 400);
    }

    const deleted = await exerciseService.deleteStagedImage(imageUrl);

    res.status(200).json({
      status: "success",
      data: { deleted },
    });
  },
);

export const create: RequestHandler = catchAsync(async (req, res) => {
  const exercise = await exerciseService.create(
    req.body,
    req.user?.id,
    req.user?.role as Role,
  );

  res.status(201).json({
    status: "success",
    data: {
      exercise,
    },
  });
});

export const getAll: RequestHandler = catchAsync(async (req, res) => {
  const result = await exerciseService.getAll(
    req.query,
    req.user?.id,
    req.user?.role as Role,
  );

  res.status(200).json({
    status: "success",
    results: result.totalResults,
    data: {
      exercises: result.exercises,
    },
  });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const exercise = await exerciseService.getById(
    req.params.id as string,
    req.user?.id,
    req.user?.role as Role,
  );

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
    req.user?.id,
    req.user?.role as Role,
  );
  res.status(200).json({
    status: "success",
    data: {
      exercise,
    },
  });
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  await exerciseService.delete(
    req.params.id as string,
    req.user?.id,
    req.user?.role as Role,
  );

  res.status(204).json({
    status: "success",
    data: null,
  });
});
