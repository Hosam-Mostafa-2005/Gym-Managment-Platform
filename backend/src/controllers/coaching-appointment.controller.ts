// src/controllers/coaching-appointment.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import coachingAppointmentService from "../services/coaching-appointment.service.js";
import { Roles } from "../constants/roles.js";

export const createAppointment: RequestHandler = catchAsync(
  async (req, res) => {
    const coachId = req.user!.id;
    const isAdmin = req.user!.role === Roles.ADMIN;

    const appointment = await coachingAppointmentService.createAppointment(
      coachId,
      req.body,
      isAdmin,
    );

    res.status(201).json({
      status: "success",
      message: "Coaching appointment scheduled successfully.",
      data: {
        appointment,
      },
    });
  },
);

export const getCoachAppointments: RequestHandler = catchAsync(
  async (req, res) => {
    const coachId = req.user!.id;
    const isAdmin = req.user!.role === Roles.ADMIN;

    const appointments =
      await coachingAppointmentService.getCoachAppointments(
        coachId,
        req.query as any,
        isAdmin,
      );

    res.status(200).json({
      status: "success",
      results: appointments.length,
      data: {
        appointments,
      },
    });
  },
);

export const getCoachAgenda: RequestHandler = catchAsync(async (req, res) => {
  const coachId = req.user!.id;
  const isAdmin = req.user!.role === Roles.ADMIN;

  const agenda = await coachingAppointmentService.getCoachAgendaSummary(
    coachId,
    isAdmin,
  );

  res.status(200).json({
    status: "success",
    data: agenda,
  });
});

export const getMemberAppointments: RequestHandler = catchAsync(
  async (req, res) => {
    const memberId = req.user!.id;

    const appointments =
      await coachingAppointmentService.getMemberAppointments(
        memberId,
        req.query as any,
      );

    res.status(200).json({
      status: "success",
      results: appointments.length,
      data: {
        appointments,
      },
    });
  },
);

export const getAppointmentById: RequestHandler = catchAsync(
  async (req, res) => {
    const appointment = await coachingAppointmentService.getAppointmentById(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(200).json({
      status: "success",
      data: {
        appointment,
      },
    });
  },
);

export const updateAppointment: RequestHandler = catchAsync(
  async (req, res) => {
    const appointment = await coachingAppointmentService.updateAppointment(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Appointment updated successfully.",
      data: {
        appointment,
      },
    });
  },
);

export const completeAppointment: RequestHandler = catchAsync(
  async (req, res) => {
    const coachId = req.user!.id;
    const isAdmin = req.user!.role === Roles.ADMIN;

    const appointment = await coachingAppointmentService.completeAppointment(
      req.params.id as string,
      coachId,
      req.body,
      isAdmin,
    );

    res.status(200).json({
      status: "success",
      message: "Appointment marked as completed.",
      data: {
        appointment,
      },
    });
  },
);

export const markNoShow: RequestHandler = catchAsync(async (req, res) => {
  const coachId = req.user!.id;
  const isAdmin = req.user!.role === Roles.ADMIN;

  const appointment = await coachingAppointmentService.markNoShow(
    req.params.id as string,
    coachId,
    req.body.coachNotes,
    isAdmin,
  );

  res.status(200).json({
    status: "success",
    message: "Appointment marked as no-show.",
    data: {
      appointment,
    },
  });
});

export const cancelAppointment: RequestHandler = catchAsync(
  async (req, res) => {
    const appointment = await coachingAppointmentService.cancelAppointment(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.body.reason,
    );

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled successfully.",
      data: {
        appointment,
      },
    });
  },
);
