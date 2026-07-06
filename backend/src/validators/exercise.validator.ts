import { z } from "zod";
import { Equipment, Difficulty } from "../constants/exercise.js";

export const createExerciseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(100),

    description: z.string().trim().optional(),

    videoUrl: z.string().url().optional(),

    equipment: z
      .array(z.enum(Object.values(Equipment) as [string, ...string[]]))
      .min(1),

    difficulty: z.enum(Object.values(Difficulty) as [string, ...string[]]),

    primaryMuscles: z.array(z.string()).min(1),

    secondaryMuscles: z.array(z.string()).default([]),

    instructions: z.array(z.string()).min(1),

    tips: z.array(z.string()).optional(),

    alternatives: z.array(z.string()).optional(),
  }),
});

export const updateExerciseSchema = z.object({
  body: createExerciseSchema.shape.body.partial(),
});
