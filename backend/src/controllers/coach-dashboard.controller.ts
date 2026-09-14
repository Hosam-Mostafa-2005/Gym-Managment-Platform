// src/controllers/coach-dashboard.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import coachDashboardService from "../services/coach-dashboard.service.js";

export const getDashboard: RequestHandler = catchAsync(async (req, res) => {
  const dashboard = await coachDashboardService.getDashboard(
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: dashboard,
  });
});
