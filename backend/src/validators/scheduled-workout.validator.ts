import { z } from "zod";

export const ScheduledWorkoutStatusEnum = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
  "RESCHEDULED",
]);

export const createScheduledWorkoutSchema = z.object({
  body: z.object({
    workoutId: z.string().min(1, "Workout ID is required"),
    scheduledAt: z
      .string()
      .datetime({ message: "Invalid ISO date string for scheduledAt" })
      .refine(
        (val) => new Date(val).getTime() > Date.now() - 5 * 60 * 1000,
        {
          message: "Scheduled time must be in the future",
        },
      ),
    assignmentId: z.string().optional(),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});

export const updateScheduledWorkoutSchema = z.object({
  body: z.object({
    scheduledAt: z
      .string()
      .datetime({ message: "Invalid ISO date string for scheduledAt" })
      .optional(),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
    status: ScheduledWorkoutStatusEnum.optional(),
  }),
});

export const createCoachScheduledWorkoutSchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
    workoutId: z.string().min(1, "Workout ID is required"),
    scheduledAt: z
      .string()
      .datetime({ message: "Invalid ISO date string for scheduledAt" }),
    assignmentId: z.string().optional(),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});

export const updateCoachScheduledWorkoutSchema = z.object({
  body: z.object({
    scheduledAt: z
      .string()
      .datetime({ message: "Invalid ISO date string for scheduledAt" })
      .optional(),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
    status: ScheduledWorkoutStatusEnum.optional(),
  }),
});
