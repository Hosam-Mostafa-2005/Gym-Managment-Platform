import { z } from "zod";

const stringItemSchema = z.object({
  value: z.string().min(1, "This field is required"),
});

export const exerciseSchema = z.object({
  name: z.string().min(3, "Exercise name must be at least 3 characters"),
  description: z.string().min(10, "Description is too short"),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  difficulty: z.string(),
  equipment: z.array(z.string()).min(1, "Select at least one equipment"),
  primaryMuscles: z
    .array(z.string())
    .min(1, "Select at least one primary muscle"),
  secondaryMuscles: z.array(z.string()),

  // هنا عرفناهم كأوبجيكتات عشان يتوافقوا مع الـ DynamicInputList والـ useFieldArray
  instructions: z
    .array(stringItemSchema)
    .min(1, "Add at least one instruction"),
  tips: z.array(stringItemSchema),
});

// هذا هو التايب الصحيح الذي يجب استخدامه داخل الـ Form والـ useFieldArray
export type ExerciseFormValues = z.infer<typeof exerciseSchema>;
