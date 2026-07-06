import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const workoutSetSchema = z.object({
  weight: z.number().nonnegative(),

  reps: z.number().int().positive(),
});

export const createWorkoutLogSchema = z.object({
  body: z.object({
    session: objectId,

    exercise: objectId,

    sets: z.array(workoutSetSchema).min(1),

    notes: z.string().trim().optional(),
  }),
});

export const updateWorkoutLogSchema = z.object({
  body: z
    .object({
      exercise: objectId.optional(),

      sets: z.array(workoutSetSchema).min(1).optional(),

      notes: z.string().trim().optional(),
    })
    .partial(),
});
