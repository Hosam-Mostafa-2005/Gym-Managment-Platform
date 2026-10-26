// src/controllers/gamification.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import gamificationService from "../services/gamification.service.js";
import { Roles } from "../constants/roles.js";

export const getMyGamification: RequestHandler = catchAsync(
  async (req, res) => {
    const overview = await gamificationService.getUserGamificationOverview(
      req.user!.id,
    );

    res.status(200).json({
      status: "success",
      data: overview,
    });
  },
);

export const getMemberGamification: RequestHandler = catchAsync(
  async (req, res) => {
    const isAdmin = req.user!.role === Roles.ADMIN;
    const overview = await gamificationService.getCoachMemberGamification(
      req.user!.id,
      req.params.memberId as string,
      isAdmin,
    );

    res.status(200).json({
      status: "success",
      data: overview,
    });
  },
);

export const sendEncouragement: RequestHandler = catchAsync(
  async (req, res) => {
    const isAdmin = req.user!.role === Roles.ADMIN;
    await gamificationService.sendCoachEncouragement(
      req.user!.id,
      req.params.memberId as string,
      req.body.message,
      isAdmin,
    );

    res.status(200).json({
      status: "success",
      message: "Encouragement sent successfully.",
    });
  },
);
