import { z } from "zod";

export const AppointmentTypeEnum = z.enum([
  "CHECK_IN",
  "PROGRESS_REVIEW",
  "CONSULTATION",
  "ASSESSMENT",
  "FORM_ANALYSIS",
  "GOAL_SETTING",
  "NUTRITION_SYNC",
]);

export const AppointmentStatusEnum = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
]);

export const createAppointmentSchema = z
  .object({
    body: z.object({
      memberId: z.string().min(1, "Member ID is required"),
      title: z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(100, "Title must not exceed 100 characters"),
      type: AppointmentTypeEnum.default("CHECK_IN"),
      startTime: z
        .string()
        .datetime({ message: "Invalid ISO date string for startTime" }),
      endTime: z
        .string()
        .datetime({ message: "Invalid ISO date string for endTime" }),
      memberNotes: z
        .string()
        .trim()
        .max(1000, "Notes must not exceed 1000 characters")
        .optional(),
      coachNotes: z
        .string()
        .trim()
        .max(1000, "Notes must not exceed 1000 characters")
        .optional(),
      location: z
        .string()
        .trim()
        .max(100, "Location must not exceed 100 characters")
        .optional(),
    }),
  })
  .refine(
    (data) =>
      new Date(data.body.endTime).getTime() >
      new Date(data.body.startTime).getTime(),
    {
      message: "End time must be strictly after start time.",
      path: ["body", "endTime"],
    },
  )
  .refine(
    (data) => {
      const diffMs =
        new Date(data.body.endTime).getTime() -
        new Date(data.body.startTime).getTime();
      return diffMs >= 10 * 60 * 1000; // Minimum 10 minutes
    },
    {
      message: "Appointment duration must be at least 10 minutes.",
      path: ["body", "endTime"],
    },
  );

export const updateAppointmentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(100).optional(),
    type: AppointmentTypeEnum.optional(),
    startTime: z
      .string()
      .datetime({ message: "Invalid ISO date string for startTime" })
      .optional(),
    endTime: z
      .string()
      .datetime({ message: "Invalid ISO date string for endTime" })
      .optional(),
    memberNotes: z.string().trim().max(1000).optional(),
    coachNotes: z.string().trim().max(1000).optional(),
    location: z.string().trim().max(100).optional(),
    status: AppointmentStatusEnum.optional(),
  }),
});

export const cancelAppointmentSchema = z.object({
  body: z.object({
    reason: z
      .string()
      .trim()
      .min(2, "Cancellation reason is required")
      .max(500, "Cancellation reason cannot exceed 500 characters"),
  }),
});

export const completeAppointmentSchema = z.object({
  body: z.object({
    coachNotes: z
      .string()
      .trim()
      .max(1000, "Coach notes cannot exceed 1000 characters")
      .optional(),
    memberNotes: z
      .string()
      .trim()
      .max(1000, "Member notes cannot exceed 1000 characters")
      .optional(),
  }),
});
