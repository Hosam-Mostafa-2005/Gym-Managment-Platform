import { z } from "zod";
import { Category, Difficulty } from "../constants/workout.js";

export const prescribedStageSchema = z.object({
  stageNumber: z.number().int().min(1).optional(),
  segmentIndex: z.number().int().min(0),
  stageLabel: z.string().optional(),
  targetWeight: z.number().min(0).nullable().optional(),
  targetReps: z.union([z.number(), z.string()]).optional(),
  isIntermediateSegment: z.boolean().optional(),
  isFinalSegment: z.boolean().optional(),
});

export const prescribedSetSchema = z.object({
  setNumber: z.number().int().min(1),
  setType: z.enum(["NORMAL", "DROP_SET", "REST_PAUSE", "WARMUP"]).default("NORMAL"),
  targetWeight: z.number().min(0).nullable().optional(),
  targetReps: z.union([z.number(), z.string()]).optional(),
  stages: z.array(prescribedStageSchema).optional(),
});

export const createWorkoutSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100),

    description: z.string().trim().optional(),

    category: z.enum(Object.values(Category) as [string, ...string[]]),

    difficulty: z.enum(Object.values(Difficulty) as [string, ...string[]]),

    estimatedDuration: z.number().min(1),

    defaultRestLarge: z.number().int().min(15).max(600).optional(),

    defaultRestSmall: z.number().int().min(15).max(600).optional(),

    isTemplate: z.boolean().optional(),

    tags: z.array(z.string()).optional(),

    exercises: z
      .array(
        z.object({
          exercise: z.string(),

          sets: z.number().min(1),

          reps: z.string(),

          targetWeight: z.number().min(0, "Target weight cannot be negative").nullable().optional(),

          targetRpe: z.number().min(1, "Target RPE must be at least 1").max(10, "Target RPE cannot exceed 10").nullable().optional(),

          restSeconds: z.number().min(0).optional(),

          isRestOverridden: z.boolean().optional(),

          notes: z.string().optional(),

          order: z.number().min(1),

          setsDetail: z.array(prescribedSetSchema).optional(),
        }),
      )
      .min(1),
  }),
});

export const updateWorkoutSchema = z.object({
  body: createWorkoutSchema.shape.body.partial(),
});
