import { z } from "zod";

export const startWorkoutSessionSchema = z.object({
  body: z.object({
    assignment: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid assignment ID"),
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
