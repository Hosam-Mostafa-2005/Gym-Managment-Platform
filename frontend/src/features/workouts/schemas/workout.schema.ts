import { z } from "zod";

export const prescribedStageSchema = z.object({
  segmentIndex: z.number().int().min(0),
  stageLabel: z.string().optional(),
  targetWeight: z.number().min(0).optional(),
  targetReps: z.union([z.number(), z.string()]).optional(),
});

export const prescribedSetSchema = z.object({
  setNumber: z.number().int().min(1),
  setType: z.enum(["NORMAL", "DROP_SET", "REST_PAUSE", "WARMUP"]),
  targetWeight: z.number().min(0).optional(),
  targetReps: z.union([z.number(), z.string()]).optional(),
  stages: z.array(prescribedStageSchema).optional(),
});

const workoutExerciseSchema = z.object({
  exercise: z.string().min(1, "Exercise is required"),

  sets: z.number().min(1, "Sets must be at least 1"),

  reps: z.string().min(1, "Reps is required"),

  targetWeight: z
    .number()
    .min(0, "Target weight cannot be negative")
    .nullable()
    .optional(),

  targetRpe: z
    .number()
    .min(1, "Target RPE must be at least 1")
    .max(10, "Target RPE cannot exceed 10")
    .nullable()
    .optional(),

  restSeconds: z.number().min(0, "Rest must be positive"),

  isRestOverridden: z.boolean().optional(),

  notes: z.string().optional(),

  order: z.number(),

  setsDetail: z.array(prescribedSetSchema).optional(),
});

export const workoutSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  estimatedDuration: z.number().min(1, "Duration is required"),
  defaultRestLarge: z.number().min(15).max(600).default(90),
  defaultRestSmall: z.number().min(15).max(600).default(60),

  // Change from: tags: z.array(z.string()).default([]),
  tags: z.array(z.string()),

  isTemplate: z.boolean(),
  exercises: z.array(workoutExerciseSchema).min(1, "Add at least one exercise"),
});

export type WorkoutFormData = z.infer<typeof workoutSchema>;
