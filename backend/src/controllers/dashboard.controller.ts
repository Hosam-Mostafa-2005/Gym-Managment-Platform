import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import dashboardService from "../services/dashboard.service.js";

export const getTrainerDashboard: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await dashboardService.getTrainerDashboard(
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

export const getMemberDashboard: RequestHandler = catchAsync(
  async (req, res) => {
    const result = await dashboardService.getMemberDashboard(req.user!.id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);
