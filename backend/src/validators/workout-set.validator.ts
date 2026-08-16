import { z } from "zod";

export const createWorkoutSetSchema = z.object({
  body: z.object({
    exerciseLog: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid exercise log id"),

    setNumber: z.number().min(1),

    targetReps: z.number().min(1),

    actualReps: z.number().min(0),

    weight: z.number().min(0),
  }),
});

export const updateWorkoutSetSchema = z.object({
  body: z.object({
    weight: z.number().min(0),
    actualReps: z.number().min(0),
  }),
});
