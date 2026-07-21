import { z } from "zod";

const workoutExerciseSchema = z.object({
  exercise: z.string().min(1, "Exercise is required"),

  sets: z.number().min(1, "Sets must be at least 1"),

  reps: z.string().min(1, "Reps is required"),

  restSeconds: z.number().min(0, "Rest must be positive"),

  notes: z.string().optional(),

  order: z.number(),
});

export const workoutSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  estimatedDuration: z.number().min(1, "Duration is required"),

  // Change from: tags: z.array(z.string()).default([]),
  tags: z.array(z.string()),

  isTemplate: z.boolean(),
  exercises: z.array(workoutExerciseSchema).min(1, "Add at least one exercise"),
});

export type WorkoutFormData = z.infer<typeof workoutSchema>;
