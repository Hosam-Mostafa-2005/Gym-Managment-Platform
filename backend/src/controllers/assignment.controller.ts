import type { RequestHandler } from "express";

import catchAsync from "../utils/catchAsync.js";
import assignmentService from "../services/assignment.service.js";

export const create: RequestHandler = catchAsync(async (req, res) => {
  const assignment = await assignmentService.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      assignment,
    },
  });
});

export const getAll: RequestHandler = catchAsync(async (req, res) => {
  const assignments = await assignmentService.getAll(req.query);

  res.status(200).json({
    status: "success",
    results: assignments.length,
    data: {
      assignments,
    },
  });
});

export const getById: RequestHandler = catchAsync(async (req, res) => {
  const assignment = await assignmentService.getById(req.params.id as string);

  res.status(200).json({
    status: "success",
    data: {
      assignment,
    },
  });
});

export const getMyAssignments: RequestHandler = catchAsync(async (req, res) => {
  const assignments = await assignmentService.getMyAssignments(req.user!.id);

  res.status(200).json({
    status: "success",
    results: assignments.length,
    data: {
      assignments,
    },
  });
});

export const update: RequestHandler = catchAsync(async (req, res) => {
  const assignment = await assignmentService.update(
    req.params.id as string,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: {
      assignment,
    },
  });
});

export const remove: RequestHandler = catchAsync(async (req, res) => {
  await assignmentService.delete(req.params.id as string);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
