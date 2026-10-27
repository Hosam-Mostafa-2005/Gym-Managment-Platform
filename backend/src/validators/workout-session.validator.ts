import { z } from "zod";

export const startWorkoutSessionSchema = z.object({
  body: z
    .object({
      assignment: z.string().min(1, "Invalid assignment ID").optional(),
      workout: z.string().min(1, "Invalid workout ID").optional(),
    })
    .refine((data) => Boolean(data.assignment || data.workout), {
      message: "Either assignment ID or workout ID must be provided",
      path: ["workout"],
    }),
});

export const finishWorkoutSessionSchema = z.object({
  body: z.object({
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
    sessionRpe: z
      .number()
      .int()
      .min(1, "RPE must be between 1 and 10")
      .max(10, "RPE must be between 1 and 10")
      .optional(),
  }),
});

export const reviewWorkoutSessionSchema = z.object({
  body: z.object({
    feedback: z
      .string()
      .trim()
      .min(1, "Feedback cannot be empty")
      .max(1000, "Feedback must not exceed 1000 characters"),
  }),
});

export const swapExerciseLogSchema = z.object({
  body: z.object({
    newExerciseId: z.string().min(1, "Replacement exercise is required"),
    reason: z
      .string()
      .trim()
      .min(1, "Swap reason is required")
      .max(500, "Reason must not exceed 500 characters"),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});
