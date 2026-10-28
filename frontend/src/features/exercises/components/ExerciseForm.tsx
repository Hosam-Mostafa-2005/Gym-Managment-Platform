import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import DynamicInputList from "./DynamicInputList";
import ExerciseImageUploader from "./ExerciseImageUploader";

import type { ExerciseFormValues } from "../schemas/exercise.schema";
import { exerciseSchema } from "../schemas/exercise.schema";
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
import type { CreateExerciseDto, Exercise } from "../types/exercise.types";

interface ExerciseFormProps {
  initialValues?: Partial<CreateExerciseDto> | Partial<Exercise>;
  exerciseId?: string;
  onSubmit: (data: CreateExerciseDto) => void;
  isPending?: boolean;
}

const ExerciseForm = ({
  initialValues,
  exerciseId,
  onSubmit,
  isPending,
}: ExerciseFormProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const resolvedExerciseId =
    exerciseId ?? (initialValues as Partial<Exercise> | undefined)?.id;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
      difficulty: "beginner",
      equipment: [],
      primaryMuscles: [],
      secondaryMuscles: [],
      instructions: [{ value: "" }],
      tips: [],
    },
  });

  const imageUrlValue = watch("imageUrl");

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
      imageUrl: initialValues.imageUrl ?? "",
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

  const handleFormSubmit = (data: ExerciseFormValues) => {
    const formattedData: CreateExerciseDto = {
      ...data,
      imageUrl: data.imageUrl ? data.imageUrl.trim() : "",
      videoUrl: data.videoUrl?.trim() || undefined,
      instructions: data.instructions
        .map((item) => item.value.trim())
        .filter(Boolean),
      tips: data.tips.map((item) => item.value.trim()).filter(Boolean),
    };

    onSubmit(formattedData);
  };

  const onFormError = (formErrors: FieldErrors<ExerciseFormValues>) => {
    const keys = Object.keys(formErrors) as (keyof ExerciseFormValues)[];
    if (keys.length > 0) {
      const firstKey = keys[0];
      const errorObj = formErrors[firstKey];
      const message =
        errorObj?.message ||
        (errorObj as any)?.root?.message ||
        `Please check the ${String(firstKey)} field.`;
      toast.error(message);

      const el =
        document.getElementById(String(firstKey)) ||
        document.querySelector(`[name="${String(firstKey)}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, onFormError)}
      className="space-y-6 sm:space-y-8"
    >
      {/* SECTION 1: BASIC INFORMATION */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Basic Information
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Provide the general details and overview of the exercise.
          </p>
        </div>

        <div className="space-y-4 pt-1 sm:pt-2">
          {/* FIELD: Exercise Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
              Exercise Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Barbell Bench Press"
              {...register("name")}
              className="bg-background text-sm"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* FIELD: Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs sm:text-sm font-medium"
            >
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Briefly describe what this exercise does and its main benefits..."
              {...register("description")}
              className="resize-none bg-background leading-relaxed text-sm"
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: CLASSIFICATION & METRICS */}
      <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Classification
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Set the experience level required for this exercise.
          </p>
        </div>

        <div className="pt-1 sm:pt-2">
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">
                  Difficulty Level
                </Label>
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

      {/* SECTION 3: MEDIA & RESOURCES */}
      <section className="space-y-6 rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-sm">
        <div className="border-b border-border/60 pb-3">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Media & Resources
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add visual references (image banner and video tutorial) to help
            users perform the exercise with optimal technique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 sm:pt-2">
          {/* FIELD: Exercise Image Upload */}
          <ExerciseImageUploader
            value={imageUrlValue}
            onChange={(url) =>
              setValue("imageUrl", url, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            exerciseId={resolvedExerciseId}
            onUploadingChange={setIsUploadingImage}
            error={errors.imageUrl?.message}
            disabled={isPending}
          />

          {/* FIELD: Video URL */}
          <div className="space-y-3">
            <Label htmlFor="videoUrl" className="text-xs sm:text-sm font-medium">
              Video Tutorial URL{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              {...register("videoUrl")}
              className="bg-background text-sm"
            />
            {errors.videoUrl && (
              <p className="text-xs font-medium text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.videoUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Link a YouTube or Vimeo video demonstration showing proper range
              of motion and pacing.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: EQUIPMENT & MUSCLE SELECTORS */}
      <div className="space-y-6 sm:space-y-8">
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

      {/* SECTION 6: INSTRUCTIONS & TIPS */}
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

      {/* SECTION 7: FORM ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isPending || isUploadingImage}
          className="w-full sm:w-auto min-w-[140px] h-10 font-semibold"
        >
          {isUploadingImage
            ? "Uploading Image..."
            : isPending
              ? "Saving..."
              : "Save Exercise"}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseForm;
