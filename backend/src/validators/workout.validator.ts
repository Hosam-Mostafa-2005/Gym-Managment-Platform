import { z } from "zod";
import { Category, Difficulty } from "../constants/workout.js";

export const createWorkoutSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100),

    description: z.string().trim().optional(),

    category: z.enum(Object.values(Category) as [string, ...string[]]),

    difficulty: z.enum(Object.values(Difficulty) as [string, ...string[]]),

    estimatedDuration: z.number().min(1),

    isTemplate: z.boolean().optional(),

    tags: z.array(z.string()).optional(),

    exercises: z
      .array(
        z.object({
          exercise: z.string(),

          sets: z.number().min(1),

          reps: z.string(),

          restSeconds: z.number().min(0),

          notes: z.string().optional(),

          order: z.number().min(1),
        }),
      )
      .min(1),
  }),
});

export const updateWorkoutSchema = z.object({
  body: createWorkoutSchema.shape.body.partial(),
});
