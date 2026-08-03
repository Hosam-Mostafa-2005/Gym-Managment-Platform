import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Dumbbell,
  ListOrdered,
  Clock,
  GripVertical,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { WorkoutFormData } from "../schemas/workout.schema";
import { workoutSchema } from "../schemas/workout.schema";
import { useAllExercises } from "@/features/exercises/hooks/useExercises";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import WorkoutExerciseItem from "./WorkoutExerciseItem";

import {
  FormCheckbox,
  FormInput,
  FormNumberInput,
  FormSelect,
  FormTextarea,
} from "@/components/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface WorkoutFormProps {
  defaultValues?: WorkoutFormData;
  onSubmit: (data: WorkoutFormData) => void;
  isSubmitting?: boolean;
}

interface SelectOption {
  label: string;
  value: string;
}

const categoryOptions: SelectOption[] = [
  { label: "Strength", value: "strength" },
  { label: "Hypertrophy", value: "hypertrophy" },
  { label: "Powerlifting", value: "powerlifting" },
  { label: "Cardio", value: "cardio" },
  { label: "Functional", value: "functional" },
];

const difficultyOptions: SelectOption[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export default function WorkoutForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: WorkoutFormProps) {
  // NEW:
  const { data: exercisesResponse } = useAllExercises();
  // Safely extract the array whether it's wrapped in data.exercises, data.data.exercises, or returned as an array directly
  const exercises: Exercise[] = Array.isArray(exercisesResponse)
    ? exercisesResponse
    : (exercisesResponse?.data?.exercises ??
      exercisesResponse?.exercises ??
      []);

  // Local state for the Exercise Library search & filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema) as Resolver<WorkoutFormData>,
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      category: "",
      difficulty: "",
      estimatedDuration: 65,
      tags: [],
      isTemplate: false,
      exercises: [],
    },
  });

  const { control, handleSubmit, watch, setValue, getValues, reset } = form;

  const { fields, append, move } = useFieldArray({
    control,
    name: "exercises",
  });

  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    // 1. Move the item visually in the array
    move(fromIndex, toIndex);

    // 2. Re-index the 'order' property for the entire array
    const updated = form.getValues("exercises").map((exercise, idx) => ({
      ...exercise,
      order: idx + 1, // Ensures order always matches position (1, 2, 3...)
    }));

    form.setValue("exercises", updated);
  };

  // Watch duration for the live sequence badge
  const estimatedDuration = watch("estimatedDuration") || 60;

  // ✅ Fix 1: Filter using primaryMuscles and secondaryMuscles instead of category
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex: Exercise) => {
      const matchesSearch = ex.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        // التحقق من العضلات الأساسية والثانوية بغض النظر عن حالة الحروف
        ex.primaryMuscles?.some(
          (m) => m.toLowerCase() === selectedCategory.toLowerCase(),
        ) ||
        ex.secondaryMuscles?.some(
          (m) => m.toLowerCase() === selectedCategory.toLowerCase(),
        ) ||
        // ميزة إضافية: لو الفلتر "legs" يشمل الـ Quadriceps أو Hamstrings أو Calves
        (selectedCategory.toLowerCase() === "legs" &&
          ex.primaryMuscles?.some((m) =>
            ["quadriceps", "hamstrings", "calves", "glutes"].includes(
              m.toLowerCase(),
            ),
          ));

      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchQuery, selectedCategory]);

  // Click-to-add from the Library
  const handleAddExerciseFromLibrary = (exerciseItem?: Exercise) => {
    append({
      exercise: exerciseItem?.id || exerciseItem?.name || "",
      sets: 3,
      reps: "8-10",
      restSeconds: 180,
      notes: "",
      order: fields.length + 1,
    });
  };

  const handleRemoveExercise = (index: number) => {
    const currentExercises = getValues("exercises") || [];
    const updated = currentExercises
      .filter((_, i) => i !== index)
      .map((exercise, i) => ({
        ...exercise,
        order: i + 1,
      }));

    setValue("exercises", updated);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 text-foreground"
    >
      {/* -------------------------------------------------------------------------- */}
      {/*                              TOP HEADER & ACTIONS                          */}
      {/* -------------------------------------------------------------------------- */}
      <div className="flex flex-col gap-6 border-b border-border/40 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4 max-w-2xl">
          <FormInput
            control={control}
            name="title"
            label=""
            placeholder="Advanced Push Day Phase 2"
            className="text-2xl font-bold md:text-3xl"
          />

          <FormTextarea
            control={control}
            name="description"
            label=""
            placeholder="Focus on heavy compound movements with volume progression for upper chest and triceps. Ensure 3 mins rest on primary lifts."
            className="min-h-[60px] resize-none text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="w-36">
              <FormSelect
                control={control}
                name="category"
                label=""
                options={categoryOptions}
                placeholder="Category"
              />
            </div>

            <div className="w-36">
              <FormSelect
                control={control}
                name="difficulty"
                label=""
                options={difficultyOptions}
                placeholder="Difficulty"
              />
            </div>

            <div className="w-40">
              <FormNumberInput
                control={control}
                name="estimatedDuration"
                label=""
                min={1}
                placeholder="Duration (min)"
              />
            </div>

            <div className="pt-1">
              <FormCheckbox
                control={control}
                name="isTemplate"
                label="Save as Template"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-end lg:self-start">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset()}
            className="text-muted-foreground hover:text-foreground"
          >
            Discard
          </Button>

          <Button type="button" variant="outline" className="border-border/60">
            Preview
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
          >
            {isSubmitting ? "Saving..." : "Save Workout"}
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/*                              MAIN WORKSPACE GRID                           */}
      {/* -------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ======================= LEFT COLUMN: LIBRARY ======================= */}
        <div className="space-y-4 lg:col-span-4 lg:border-r lg:border-border/40 lg:pr-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Library</h3>
            <span className="text-xs text-muted-foreground">
              {filteredExercises.length} available
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/40 border-border/60 focus-visible:ring-1"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["chest", "triceps", "shoulders", "back", "legs"].map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                className="cursor-pointer capitalize px-3 py-1 font-normal transition-colors"
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Exercise List Cards */}
          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 pt-2 custom-scrollbar">
            {filteredExercises.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No exercises found.
              </div>
            ) : (
              filteredExercises.map((ex: Exercise, idx: number) => (
                <div
                  key={ex.id || idx}
                  onClick={() => handleAddExerciseFromLibrary(ex)}
                  className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-3.5 transition-all hover:border-border hover:bg-card/80 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    <div>
                      <h4 className="text-sm font-medium leading-none text-foreground group-hover:text-emerald-400 transition-colors">
                        {ex.name || `Exercise #${idx + 1}`}
                      </h4>
                      {/* ✅ Fix 2: Safely join arrays for equipment and primaryMuscles */}
                      <p className="mt-1.5 text-xs text-muted-foreground capitalize">
                        {ex.equipment?.length
                          ? ex.equipment.join(", ")
                          : "Bodyweight"}{" "}
                        •{" "}
                        {ex.primaryMuscles?.length
                          ? ex.primaryMuscles.join(", ")
                          : ex.difficulty}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4 text-emerald-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ====================== RIGHT COLUMN: SEQUENCE ====================== */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-border/60 bg-card/20 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                  <ListOrdered className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Sequence
                </h3>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <Dumbbell className="h-3.5 w-3.5 text-emerald-500" />
                <span>{fields.length} Exercises</span>
                <span className="text-border">•</span>
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                <span>~{estimatedDuration} mins</span>
              </div>
            </div>

            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-center">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
                  <p className="text-base font-medium text-foreground">
                    Your workout sequence is empty
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Click any exercise from the Library on the left to add it to
                    your routine, or use the button below.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExerciseFromLibrary()}
                    className="mt-6 border-dashed border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Exercise
                  </Button>
                </div>
              ) : (
                fields.map((field, index) => (
                  <WorkoutExerciseItem
                    key={field.id}
                    index={index}
                    control={control}
                    exercises={exercises} // <-- Passes the full library array here
                    remove={handleRemoveExercise}
                    move={handleMoveExercise}
                    total={fields.length}
                  />
                ))
              )}
            </div>

            {fields.length > 0 && (
              <button
                type="button"
                onClick={() => handleAddExerciseFromLibrary()}
                className="w-full rounded-lg border border-dashed border-border/60 p-4 text-center text-sm font-medium text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Exercise to Sequence
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
