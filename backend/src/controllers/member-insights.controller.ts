// src/controllers/member-insights.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import memberInsightsService from "../services/member-insights.service.js";

export const getMemberInsights: RequestHandler = catchAsync(
  async (req, res) => {
    const insights = await memberInsightsService.getInsights(
      req.params.memberId as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      data: insights,
    });
  },
);
