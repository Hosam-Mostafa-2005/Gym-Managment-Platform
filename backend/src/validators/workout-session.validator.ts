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
  }),
});
