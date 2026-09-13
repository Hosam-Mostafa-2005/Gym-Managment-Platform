// src/controllers/body-measurement.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import bodyMeasurementService from "../services/body-measurement.service.js";

export const createBodyMeasurement: RequestHandler = catchAsync(
  async (req, res) => {
    const measurement = await bodyMeasurementService.create(
      req.body,
      req.user!.id,
      req.user!.role,
    );

    res.status(201).json({
      status: "success",
      data: {
        measurement,
      },
    });
  },
);

export const getMemberMeasurements: RequestHandler = catchAsync(
  async (req, res) => {
    const measurements = await bodyMeasurementService.getAllByMember(
      req.params.memberId as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      results: measurements.length,
      data: {
        measurements,
      },
    });
  },
);

export const getLatestMemberMeasurement: RequestHandler = catchAsync(
  async (req, res) => {
    const measurement = await bodyMeasurementService.getLatest(
      req.params.memberId as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      data: {
        measurement,
      },
    });
  },
);

export const getBodyMeasurementById: RequestHandler = catchAsync(
  async (req, res) => {
    const measurement = await bodyMeasurementService.getById(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      data: {
        measurement,
      },
    });
  },
);

export const updateBodyMeasurement: RequestHandler = catchAsync(
  async (req, res) => {
    const measurement = await bodyMeasurementService.update(
      req.params.id as string,
      req.body,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      data: {
        measurement,
      },
    });
  },
);

export const deleteBodyMeasurement: RequestHandler = catchAsync(
  async (req, res) => {
    await bodyMeasurementService.delete(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
