import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicInputList from "./DynamicInputList";

// 1. استدعاء التايب الصحيح الخاص بالفورم
import type { ExerciseFormValues } from "../schemas/exercise.schema";
import { exerciseSchema } from "../schemas/exercise.schema.ts";
import CheckboxGroup from "./CheckboxGroup";

import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
} from "../constants/exercise.constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateExerciseDto } from "../types/exercise.types.ts";

interface ExerciseFormProps {
  initialValues?: Partial<CreateExerciseDto>;

  onSubmit: (data: CreateExerciseDto) => void;

  isPending?: boolean;
}

const ExerciseForm = ({
  initialValues,
  onSubmit,
  isPending,
}: ExerciseFormProps) => {
  // ==========================================
  // 1. FORM SETUP & VALIDATION
  // استخدمنا ExerciseFormValues بدلاً من CreateExerciseDto لحل مشكلة الـ Resolver
  // ==========================================
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      videoUrl: "",
      difficulty: "beginner",
      equipment: [],
      primaryMuscles: [],
      secondaryMuscles: [],
      // تم تعديل القيم الافتراضية لتكون Objects كما يتطلب الـ Schema
      instructions: [{ value: "" }],
      tips: [],
    },
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: "instructions",
  });

  const {
    fields: tipFields,
    append: appendTip,
    remove: removeTip,
  } = useFieldArray({
    control,
    name: "tips",
  });
  useEffect(() => {
    if (!initialValues) return;

    reset({
      name: initialValues.name ?? "",
      description: initialValues.description ?? "",
      videoUrl: initialValues.videoUrl ?? "",
      difficulty: initialValues.difficulty ?? "beginner",

      equipment: initialValues.equipment ?? [],

      primaryMuscles: initialValues.primaryMuscles ?? [],

      secondaryMuscles: initialValues.secondaryMuscles ?? [],

      instructions: initialValues.instructions?.map((item) => ({
        value: item,
      })) ?? [{ value: "" }],

      tips:
        initialValues.tips?.map((item) => ({
          value: item,
        })) ?? [],
    });
  }, [initialValues, reset]);

  // 2. دالة وسيطة لتحويل الـ [{ value: "text" }] إلى ["text"] قبل إرسالها للـ API
  const handleFormSubmit = (data: ExerciseFormValues) => {
    const formattedData: CreateExerciseDto = {
      ...data,
      instructions: data.instructions.map((item) => item.value),
      tips: data.tips.map((item) => item.value),
    };

    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* ==========================================
          SECTION 1: BASIC INFORMATION
          Handles core identity of the exercise (Name & Description)
          ========================================== */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Basic Information
          </h3>
          <p className="text-sm text-muted-foreground">
            Provide the general details and overview of the exercise.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* FIELD: Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Exercise Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Barbell Bench Press"
              {...register("name")}
              className="bg-background"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* FIELD: Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Briefly describe what this exercise does and its main benefits..."
              {...register("description")}
              className="resize-none bg-background leading-relaxed"
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: CLASSIFICATION & METRICS
          Handles categorization like Difficulty level
          ========================================== */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Classification
          </h3>
          <p className="text-sm text-muted-foreground">
            Set the experience level required for this exercise.
          </p>
        </div>

        <div className="pt-2">
          {/* FIELD: Difficulty (Using Controlled Component for Shadcn Select) */}
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Difficulty Level</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full sm:w-1/2 bg-background capitalize">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((difficulty) => (
                      <SelectItem
                        key={difficulty}
                        value={difficulty}
                        className="capitalize"
                      >
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.difficulty && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </section>

      {/* ==========================================
          SECTION 3: MEDIA & RESOURCES
          Handles external tutorials and media links
          ========================================== */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Media & Tutorials
          </h3>
          <p className="text-sm text-muted-foreground">
            Add a visual demonstration link to help users perform the exercise
            correctly.
          </p>
        </div>

        <div className="pt-2">
          {/* FIELD: Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-sm font-medium">
              Video URL{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              {...register("videoUrl")}
              className="bg-background"
            />
            {errors.videoUrl && (
              <p className="text-xs font-medium text-destructive">
                {errors.videoUrl.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-8">
        <Controller
          control={control}
          name="equipment"
          render={({ field }) => (
            <CheckboxGroup
              title="Equipment"
              description="Select the equipment required for this exercise."
              options={EQUIPMENT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.equipment?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="primaryMuscles"
          render={({ field }) => (
            <CheckboxGroup
              title="Primary Muscles"
              description="Select the main muscles targeted."
              options={MUSCLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.primaryMuscles?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="secondaryMuscles"
          render={({ field }) => (
            <CheckboxGroup
              title="Secondary Muscles"
              description="Select any supporting muscles."
              options={MUSCLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.secondaryMuscles?.message}
            />
          )}
        />
      </div>

      {/* ==========================================
    SECTION 6: INSTRUCTIONS & TIPS
========================================== */}
      <DynamicInputList
        title="Instructions"
        description="Add the exercise steps in order."
        fields={instructionFields}
        register={register}
        name="instructions"
        append={appendInstruction}
        remove={removeInstruction}
        error={errors.instructions?.message}
      />

      <DynamicInputList
        title="Tips"
        description="Optional tips for better execution."
        fields={tipFields}
        register={register}
        name="tips"
        append={appendTip}
        remove={removeTip}
        error={errors.tips?.message}
      />
      {/* ==========================================
            SECTION 4: FORM ACTIONS (SUBMIT / CANCEL)
            Triggers form submission or handles loading states
            ========================================== */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
          {isPending ? "Saving..." : "Save Exercise"}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseForm;
