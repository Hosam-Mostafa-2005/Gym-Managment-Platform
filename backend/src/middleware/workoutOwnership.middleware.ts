import type { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";

export const checkWorkoutOwnership = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError("You are not logged in.", 401);
    }

    // Admin bypasses ownership
    if (req.user.role === Roles.ADMIN) {
      return next();
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      throw new AppError("Workout ID is required.", 400);
    }

    const workout = await prisma.workout.findUnique({
      where: { id },
    });

    if (!workout || !workout.isActive) {
      throw new AppError("Workout not found.", 404);
    }

    if (workout.createdBy !== req.user.id) {
      throw new AppError("You are not allowed to access this workout.", 403);
    }

    next();
  },
);

export const ownsWorkout = checkWorkoutOwnership;
export default checkWorkoutOwnership;
