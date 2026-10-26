import { z } from "zod";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

const idSchema = (name: string) => z.string().min(1, `Invalid ${name} ID`);

export const createAssignmentSchema = z
  .object({
    body: z.object({
      member: idSchema("member"),
      trainer: idSchema("trainer").optional(),
      workout: idSchema("workout"),

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
      member: idSchema("member").optional(),
      trainer: idSchema("trainer").optional(),
      workout: idSchema("workout").optional(),

      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),

      status: z
        .enum([
          ASSIGNMENT_STATUS.ACTIVE,
          ASSIGNMENT_STATUS.COMPLETED,
          ASSIGNMENT_STATUS.CANCELLED,
        ])
        .optional(),

      cancelReason: z
        .string()
        .trim()
        .min(1, "Cancel reason is required.")
        .max(500, "Cancel reason must not exceed 500 characters")
        .optional(),

      notes: z
        .string()
        .trim()
        .max(500, "Notes must not exceed 500 characters")
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.body.startDate &&
      data.body.endDate &&
      data.body.endDate < data.body.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be after start date.",
        path: ["body", "endDate"],
      });
    }

    if (
      data.body.status === ASSIGNMENT_STATUS.CANCELLED &&
      !data.body.cancelReason
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Cancel reason is required.",
        path: ["body", "cancelReason"],
      });
    }

    if (
      data.body.status &&
      data.body.status !== ASSIGNMENT_STATUS.CANCELLED &&
      data.body.cancelReason
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Cancel reason can only be provided for cancelled assignments.",
        path: ["body", "cancelReason"],
      });
    }
  });
