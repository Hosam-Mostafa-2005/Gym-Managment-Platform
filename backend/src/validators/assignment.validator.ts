import { z } from "zod";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

export const createAssignmentSchema = z
  .object({
    body: z.object({
      member: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),

      workout: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid workout ID"),

      startDate: z.coerce.date({
        error: "Start date is required",
      }),

      endDate: z.coerce.date({
        error: "End date is required",
      }),

      status: z
        .enum([
          ASSIGNMENT_STATUS.ACTIVE,
          ASSIGNMENT_STATUS.COMPLETED,
          ASSIGNMENT_STATUS.CANCELLED,
        ])
        .optional(),

      notes: z
        .string()
        .trim()
        .max(500, "Notes must not exceed 500 characters")
        .optional(),
    }),
  })
  .refine((data) => data.body.endDate >= data.body.startDate, {
    message: "End date must be after start date.",
    path: ["body", "endDate"],
  });

export const updateAssignmentSchema = z
  .object({
    body: z.object({
      member: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID")
        .optional(),

      workout: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid workout ID")
        .optional(),

      startDate: z.coerce.date().optional(),

      endDate: z.coerce.date().optional(),

      status: z
        .enum([
          ASSIGNMENT_STATUS.ACTIVE,
          ASSIGNMENT_STATUS.COMPLETED,
          ASSIGNMENT_STATUS.CANCELLED,
        ])
        .optional(),

      notes: z
        .string()
        .trim()
        .max(500, "Notes must not exceed 500 characters")
        .optional(),
    }),
  })
  .refine(
    (data) => {
      if (!data.body.startDate || !data.body.endDate) return true;

      return data.body.endDate >= data.body.startDate;
    },
    {
      message: "End date must be after start date.",
      path: ["body", "endDate"],
    },
  );
