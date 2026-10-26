import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import scheduledWorkoutService from "../services/scheduled-workout.service.js";
import { Roles } from "../constants/roles.js";

// ==========================================
// MEMBER ENDPOINTS
// ==========================================

export const create: RequestHandler = catchAsync(async (req, res) => {
  const scheduled = await scheduledWorkoutService.create(
    req.user!.id,
    req.body,
  );

  res.status(201).json({
    status: "success",
    data: {
      scheduledWorkout: scheduled,
    },
  });
});

export const getAll: RequestHandler = catchAsync(async (req, res) => {
  const scheduledWorkouts = await scheduledWorkoutService.getAll(
    req.user!.id,
    req.query as any,
  );

  res.status(200).json({
    status: "success",
    results: scheduledWorkouts.length,
    data: {
      scheduledWorkouts,
    },
  });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const scheduledWorkout = await scheduledWorkoutService.getById(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: {
      scheduledWorkout,
    },
  });
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const scheduledWorkout = await scheduledWorkoutService.update(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: {
      scheduledWorkout,
    },
  });
});

export const cancel: RequestHandler = catchAsync(async (req, res) => {
  const scheduledWorkout = await scheduledWorkoutService.cancel(
    req.params.id as string,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    data: {
      scheduledWorkout,
    },
  });
});

export const start: RequestHandler = catchAsync(async (req, res) => {
  const session = await scheduledWorkoutService.start(
    req.params.id as string,
    req.user!.id,
  );

  res.status(201).json({
    status: "success",
    data: {
      session,
    },
  });
});

export const getSummary: RequestHandler = catchAsync(async (req, res) => {
  const summary = await scheduledWorkoutService.getMemberCalendarSummary(
    req.user!.id,
    req.query.date as string | undefined,
  );

  res.status(200).json({
    status: "success",
    data: summary,
  });
});

// ==========================================
// COACH ENDPOINTS
// ==========================================

export const getCoachScheduledWorkouts: RequestHandler = catchAsync(
  async (req, res) => {
    const workouts = await scheduledWorkoutService.getCoachScheduledWorkouts(
      req.user!.id,
      req.query as any,
      req.user!.role === Roles.ADMIN,
    );

    res.status(200).json({
      status: "success",
      results: workouts.length,
      data: {
        scheduledWorkouts: workouts,
      },
    });
  },
);

export const createCoachScheduled: RequestHandler = catchAsync(
  async (req, res) => {
    const scheduled = await scheduledWorkoutService.createCoachScheduled(
      req.user!.id,
      req.body,
      req.user!.role === Roles.ADMIN,
    );

    res.status(201).json({
      status: "success",
      message: "Workout scheduled for athlete successfully.",
      data: {
        scheduledWorkout: scheduled,
      },
    });
  },
);

export const updateCoachScheduled: RequestHandler = catchAsync(
  async (req, res) => {
    const scheduled = await scheduledWorkoutService.updateCoachScheduled(
      req.user!.id,
      req.params.id as string,
      req.body,
      req.user!.role === Roles.ADMIN,
    );

    res.status(200).json({
      status: "success",
      message: "Scheduled workout updated successfully.",
      data: {
        scheduledWorkout: scheduled,
      },
    });
  },
);

export const cancelCoachScheduled: RequestHandler = catchAsync(
  async (req, res) => {
    const scheduled = await scheduledWorkoutService.cancelCoachScheduled(
      req.user!.id,
      req.params.id as string,
      req.body.reason,
      req.user!.role === Roles.ADMIN,
    );

    res.status(200).json({
      status: "success",
      message: "Scheduled workout cancelled successfully.",
      data: {
        scheduledWorkout: scheduled,
      },
    });
  },
);
