import { z } from "zod";

const instructionItemSchema = z.object({
  value: z.string().min(1, "Step instruction cannot be empty"),
});

const tipItemSchema = z.object({
  value: z.string(),
});

export const exerciseSchema = z.object({
  name: z.string().min(3, "Exercise name must be at least 3 characters"),
  description: z.string().min(10, "Description is too short (minimum 10 characters)"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  difficulty: z.string(),
  equipment: z.array(z.string()).min(1, "Select at least one equipment option"),
  primaryMuscles: z
    .array(z.string())
    .min(1, "Select at least one primary muscle"),
  secondaryMuscles: z.array(z.string()),

  instructions: z
    .array(instructionItemSchema)
    .min(1, "Add at least one instruction step"),
  tips: z.array(tipItemSchema),
});

export type ExerciseFormValues = z.infer<typeof exerciseSchema>;
