import type { RequestHandler } from "express";

import Workout from "../models/Workout.model.js";
import AppError from "../utils/AppError.js";
import { Roles } from "../constants/roles.js";

export const ownsWorkout: RequestHandler = async (req, _res, next) => {
  if (!req.user) {
    return next(new AppError("You are not logged in.", 401));
  }

  // Admin bypasses ownership
  if (req.user.role === Roles.ADMIN) {
    return next();
  }

  const workout = await Workout.findById(req.params.id);

  if (!workout || !workout.isActive) {
    return next(new AppError("Workout not found.", 404));
  }

  if (workout.createdBy.toString() !== req.user.id) {
    return next(
      new AppError("You are not allowed to access this workout.", 403),
    );
  }

  next();
};
