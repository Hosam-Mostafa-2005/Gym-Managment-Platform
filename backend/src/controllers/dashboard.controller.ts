import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import dashboardService from "../services/dashboard.service.js";

export const getTrainerDashboard: RequestHandler = catchAsync(
  async (req, res) => {
    const dashboard = await dashboardService.getTrainerDashboard();

    res.status(200).json({
      status: "success",
      data: {
        dashboard,
      },
    });
  },
);

export const getMemberDashboard: RequestHandler = catchAsync(
  async (req, res) => {
    const dashboard = await dashboardService.getMemberDashboard(req.user!.id);

    res.status(200).json({
      status: "success",
      data: {
        dashboard,
      },
    });
  },
);
