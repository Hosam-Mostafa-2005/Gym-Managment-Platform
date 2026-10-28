import { z } from "zod";

export const createWorkoutSetSchema = z.object({
  body: z.object({
    exerciseLog: z.string().min(1, "Invalid exercise log id"),

    setNumber: z.number().min(1),

    targetReps: z.union([z.number(), z.string()]).optional(),

    actualReps: z.number().min(0).optional(),

    weight: z.number().min(0).optional(),

    setType: z
      .enum(["NORMAL", "DROP_SET", "REST_PAUSE", "WARMUP"])
      .optional(),

    segmentIndex: z.number().int().min(0).optional(),

    isIntermediateSegment: z.boolean().optional(),

    isFinalSegment: z.boolean().optional(),
  }),
});

export const updateWorkoutSetSchema = z.object({
  body: z.object({
    weight: z.number().min(0).optional(),
    actualReps: z.number().min(0).optional(),
    completed: z.boolean().optional(),
    restDuration: z.number().min(0).optional(),
    setType: z
      .enum(["NORMAL", "DROP_SET", "REST_PAUSE", "WARMUP"])
      .optional(),
    segmentIndex: z.number().int().min(0).optional(),
    isIntermediateSegment: z.boolean().optional(),
    isFinalSegment: z.boolean().optional(),
  }),
});
