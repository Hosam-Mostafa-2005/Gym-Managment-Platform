import { z } from "zod";

export const createWorkoutSetSchema = z.object({
  body: z.object({
    exerciseLog: z.string().min(1, "Invalid exercise log id"),

    setNumber: z.number().min(1),

    targetReps: z.number().min(1).optional(),

    actualReps: z.number().min(0).optional(),

    weight: z.number().min(0).optional(),
  }),
});

export const updateWorkoutSetSchema = z.object({
  body: z.object({
    weight: z.number().min(0).optional(),
    actualReps: z.number().min(0).optional(),
    completed: z.boolean().optional(),
    restDuration: z.number().min(0).optional(),
  }),
});
