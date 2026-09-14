// src/controllers/members-management.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import membersManagementService from "../services/members-management.service.js";

export const getAllMembers: RequestHandler = catchAsync(async (req, res) => {
  const result = await membersManagementService.getAllMembers(
    req.query,
    req.user!.id,
    req.user!.role,
  );

  res.status(200).json({
    status: "success",
    data: {
      members: result.members,
      pagination: result.pagination,
    },
  });
});
