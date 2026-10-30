import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Dumbbell,
  ListOrdered,
  Clock,
  GripVertical,
} from "lucide-react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { WorkoutFormData } from "../schemas/workout.schema";
import { workoutSchema } from "../schemas/workout.schema";
import { useAllExercises } from "@/features/exercises/hooks/useExercises";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import { ALL_MUSCLE_CATEGORIES, doesExerciseMatchMuscle } from "@/features/exercises/constants/exercise.constants";
import { getRecommendedRestSeconds } from "../utils/rest-classification";
import WorkoutExerciseItem from "./WorkoutExerciseItem";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

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
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["workouts", "common"]);
  // NEW:
  const { data: user } = useCurrentUser();
  const isMember = user?.role === ROLES.MEMBER;

  const translatedCategoryOptions = useMemo(
    () => [
      { label: t("categories.strength", "Strength"), value: "strength" },
      { label: t("categories.hypertrophy", "Hypertrophy"), value: "hypertrophy" },
      { label: t("categories.powerlifting", "Powerlifting"), value: "powerlifting" },
      { label: t("categories.cardio", "Cardio"), value: "cardio" },
      { label: t("categories.functional", "Functional"), value: "functional" },
    ],
    [t],
  );

  const translatedDifficultyOptions = useMemo(
    () => [
      { label: t("difficulties.beginner", "Beginner"), value: "beginner" },
      { label: t("difficulties.intermediate", "Intermediate"), value: "intermediate" },
      { label: t("difficulties.advanced", "Advanced"), value: "advanced" },
    ],
    [t],
  );

  const { data: exercisesResponse } = useAllExercises();
  // Safely extract the array whether it's wrapped in data.exercises, data.data.exercises, or returned as an array directly
  const exercises: Exercise[] = Array.isArray(exercisesResponse)
    ? exercisesResponse
    : (exercisesResponse?.exercises ?? exercisesResponse?.exercises ?? []);

  // Local state for the Exercise Library search & filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema) as Resolver<WorkoutFormData>,
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          isTemplate: isMember ? false : Boolean(defaultValues.isTemplate),
        }
      : {
          title: "",
          description: "",
          category: "",
          difficulty: "",
          estimatedDuration: 65,
          defaultRestLarge: 90,
          defaultRestSmall: 60,
          tags: [],
          isTemplate: false,
          exercises: [],
        },
  });

  const { control, handleSubmit, watch, setValue, getValues, reset } = form;

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        isTemplate: isMember ? false : Boolean(defaultValues.isTemplate),
      });
    }
  }, [defaultValues, reset, isMember]);

  const { fields, append, move } = useFieldArray({
    control,
    name: "exercises",
  });

  const recalculateNonOverriddenExercises = (largeRest: number, smallRest: number) => {
    const currentList = getValues("exercises") || [];
    const updated = currentList.map((item) => {
      if (item.isRestOverridden) return item;
      const exEntity = exercises.find((e) => (e._id || e.id) === item.exercise);
      const autoRest = getRecommendedRestSeconds(
        exEntity?.primaryMuscles || [],
        largeRest,
        smallRest,
      );
      return {
        ...item,
        restSeconds: autoRest,
      };
    });
    setValue("exercises", updated);
  };

  const handleLargeRestChange = (newVal: number) => {
    setValue("defaultRestLarge", newVal);
    const curSmall = getValues("defaultRestSmall") ?? 60;
    recalculateNonOverriddenExercises(newVal, curSmall);
  };

  const handleSmallRestChange = (newVal: number) => {
    setValue("defaultRestSmall", newVal);
    const curLarge = getValues("defaultRestLarge") ?? 90;
    recalculateNonOverriddenExercises(curLarge, newVal);
  };

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

      const matchesCategory = doesExerciseMatchMuscle(ex, selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchQuery, selectedCategory]);

  // Click-to-add from the Library with automatic rest duration calculation
  const handleAddExerciseFromLibrary = (exerciseItem?: Exercise) => {
    const currentLarge = getValues("defaultRestLarge") ?? 90;
    const currentSmall = getValues("defaultRestSmall") ?? 60;
    const autoRest = getRecommendedRestSeconds(
      exerciseItem?.primaryMuscles || [],
      currentLarge,
      currentSmall,
    );

    append({
      exercise: exerciseItem?.id || exerciseItem?.name || "",
      sets: 3,
      reps: "8-10",
      restSeconds: autoRest,
      isRestOverridden: false,
      notes: "",
      order: fields.length + 1,
      targetWeight: undefined,
      targetRpe: undefined,
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
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit({
            ...data,
            isTemplate: isMember ? false : Boolean(data.isTemplate),
          });
        })}
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
            placeholder={t("form.titlePlaceholder", "e.g. Upper Body Hypertrophy Focus")}
            className="text-2xl font-bold md:text-3xl"
          />

          <FormTextarea
            control={control}
            name="description"
            label=""
            placeholder={t("form.descriptionPlaceholder", "Brief notes about the goals, focus, or structure of this routine...")}
            className="min-h-[60px] resize-none text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="w-full sm:w-36">
              <FormSelect
                control={control}
                name="category"
                label=""
                options={translatedCategoryOptions}
                placeholder={t("form.categoryPlaceholder", "Category")}
              />
            </div>

            <div className="w-full sm:w-36">
              <FormSelect
                control={control}
                name="difficulty"
                label=""
                options={translatedDifficultyOptions}
                placeholder={t("form.difficultyPlaceholder", "Difficulty")}
              />
            </div>

            <div className="w-full sm:w-40">
              <FormNumberInput
                control={control}
                name="estimatedDuration"
                label=""
                min={1}
                placeholder={t("form.durationPlaceholder", "Duration (min)")}
              />
            </div>

            {isMember ? (
              <div
                className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400"
                title="Your workout will be saved privately in your personal routines collection"
              >
                <span className="h-2 w-2 rounded-full bg-[#5BE584] animate-pulse" />
                <span className="font-semibold text-foreground">{t("badges.personalRoutine", "Personal Routine")}</span>
                <span className="text-[11px] text-muted-foreground">
                  ({t("badges.personal", "Personal")})
                </span>
              </div>
            ) : (
              <div className="pt-1">
                <FormCheckbox
                  control={control}
                  name="isTemplate"
                  label={t("form.isTemplateLabel", "Publish as Library Template")}
                />
              </div>
            )}
          </div>

          {/* Preferred Rest-Time Settings (Phase 3.1) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>{t("form.restPreferences", "Rest Preferences:")}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground whitespace-nowrap">
                {t("form.restLargeLabel", "Large Muscles:")}
              </label>
              <select
                value={watch("defaultRestLarge") ?? 90}
                onChange={(e) => handleLargeRestChange(Number(e.target.value))}
                className="h-8 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              >
                <option value={45}>45{t("form.secondsUnit", "s")}</option>
                <option value={60}>60{t("form.secondsUnit", "s")}</option>
                <option value={90}>90{t("form.secondsUnit", "s")}</option>
                <option value={120}>120{t("form.secondsUnit", "s")}</option>
                <option value={150}>150{t("form.secondsUnit", "s")}</option>
                <option value={180}>180{t("form.secondsUnit", "s")}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground whitespace-nowrap">
                {t("form.restSmallLabel", "Small Muscles:")}
              </label>
              <select
                value={watch("defaultRestSmall") ?? 60}
                onChange={(e) => handleSmallRestChange(Number(e.target.value))}
                className="h-8 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              >
                <option value={30}>30{t("form.secondsUnit", "s")}</option>
                <option value={45}>45{t("form.secondsUnit", "s")}</option>
                <option value={60}>60{t("form.secondsUnit", "s")}</option>
                <option value={90}>90{t("form.secondsUnit", "s")}</option>
                <option value={120}>120{t("form.secondsUnit", "s")}</option>
              </select>
            </div>

            <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">
              {t("form.restAutoHint", "(Auto assigned by muscle group)")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end self-end lg:self-start">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset()}
            className="text-muted-foreground hover:text-foreground"
          >
            {t("actions.discard", "Discard")}
          </Button>

          <Button type="button" variant="outline" className="border-border/60">
            {t("actions.preview", "Preview")}
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all"
          >
            {isSubmitting ? t("actions.saving", "Saving...") : t("actions.saveWorkout", "Save Workout")}
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/*                              MAIN WORKSPACE GRID                           */}
      {/* -------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ======================= LEFT COLUMN: LIBRARY ======================= */}
        <div className="space-y-4 lg:col-span-4 lg:border-r lg:border-border/40 lg:pr-6 rtl:lg:border-r-0 rtl:lg:border-l rtl:lg:pr-0 rtl:lg:pl-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">{t("form.library", "Library")}</h3>
            <span className="text-xs text-muted-foreground">
              {t("form.availableCount", { count: filteredExercises.length, defaultValue: `${filteredExercises.length} available` })}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("form.findExercises", "Find exercises...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 bg-card/40 border-border/60 focus-visible:ring-1"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ALL_MUSCLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory?.toLowerCase() === cat.toLowerCase();
              return (
                <Badge
                  key={cat}
                  variant={isSelected ? "default" : "secondary"}
                  className="cursor-pointer capitalize px-2.5 py-1 font-normal transition-colors"
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : cat)
                  }
                >
                  {cat}
                </Badge>
              );
            })}
          </div>

          {/* Exercise List Cards */}
          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 rtl:pr-0 rtl:pl-1 pt-2 custom-scrollbar">
            {filteredExercises.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {t("form.noExercisesFound", "No exercises found.")}
              </div>
            ) : (
              filteredExercises.map((ex: Exercise, idx: number) => (
                <div
                  key={ex.id || idx}
                  onClick={() => handleAddExerciseFromLibrary(ex)}
                  className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-3.5 transition-all hover:border-border hover:bg-card/80 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                    <ExerciseImage
                      src={ex.imageUrl}
                      alt={ex.name}
                      size="xs"
                      fit="contain"
                    />
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
                  {t("form.sequence", "Sequence")}
                </h3>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                <Dumbbell className="h-3.5 w-3.5 text-emerald-500" />
                <span>{t("form.exercisesCount", { count: fields.length, defaultValue: `${fields.length} Exercises` })}</span>
                <span className="text-border">•</span>
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                <span>{t("form.durationEst", { duration: estimatedDuration, defaultValue: `~${estimatedDuration} mins` })}</span>
              </div>
            </div>

            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-center">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
                  <p className="text-base font-medium text-foreground">
                    {t("form.emptySequenceTitle", "Your workout sequence is empty")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {t("form.emptySequenceDesc", "Click any exercise from the Library on the left to add it to your routine, or use the button below.")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExerciseFromLibrary()}
                    className="mt-6 border-dashed border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t("actions.addCustomExercise", "Add Custom Exercise")}
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
                {t("actions.addAnotherExercise", "Add Another Exercise to Sequence")}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
    </FormProvider>
  );
}
