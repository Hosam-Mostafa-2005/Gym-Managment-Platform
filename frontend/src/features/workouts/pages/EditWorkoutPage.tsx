import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  ShieldCheck,
  AlertCircle,
  Pencil,
} from "lucide-react";

import WorkoutBuilder from "../components/WorkoutForm";
import { useWorkout } from "../hooks/useWorkout";
import { useUpdateWorkout } from "../hooks/useUpdateWorkout";
import type { WorkoutFormData } from "../schemas/workout.schema";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EditWorkoutPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  // 1. Fetch existing workout data
  const { data: workout, isLoading, isError } = useWorkout(workoutId || "");

  // 2. Initialize update mutation
  const { mutate: updateWorkout, isPending: isSubmitting } = useUpdateWorkout();

  // 3. Handle form submission
  function handleSubmit(data: WorkoutFormData) {
    if (!workoutId) return;

    // Pass updated data to mutation (adjust structure if your hook expects (id, data))
    updateWorkout(
      {
        id: workoutId,
        data,
      },
      {
        onSuccess: () => {
          navigate(`/workouts/${workoutId}`);
        },
        onError: (err) => {
          console.log("Mutation error response:", err); // لو السيرفر رفضه هيبان هنا
        },
      },
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                             LOADING SKELETON                               */
  /* -------------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <section className="space-y-8 animate-in fade-in duration-300 text-foreground">
        <div className="flex flex-col gap-4 border-b border-border/40 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3 w-full max-w-xl">
            <div className="flex gap-2">
              <div className="h-8 w-36 rounded-lg bg-card/40 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-card/40 animate-pulse" />
            </div>
            <div className="h-8 w-64 rounded-lg bg-card/60 animate-pulse" />
            <div className="h-4 w-96 rounded-lg bg-card/30 animate-pulse" />
          </div>
          <div className="flex gap-2 self-start lg:self-auto">
            <div className="h-8 w-24 rounded-lg bg-card/40 animate-pulse" />
            <div className="h-8 w-28 rounded-lg bg-card/40 animate-pulse" />
          </div>
        </div>
        <div className="h-[600px] rounded-xl border border-border/40 bg-card/20 animate-pulse" />
      </section>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              ERROR / NOT FOUND                             */
  /* -------------------------------------------------------------------------- */
  if (isError || !workout) {
    return (
      <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/10 p-16 text-center animate-in fade-in duration-300 text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Workout Not Found</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          We could not load the details for this workout routine. It may have
          been deleted or archived.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/workouts")}
            className="border-border/60 hover:bg-accent/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Library
          </Button>
          {workoutId && (
            <Button
              variant="default"
              onClick={() => navigate(`/workouts/${workoutId}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Try Details Page
            </Button>
          )}
        </div>
      </section>
    );
  }

  const defaultValues: WorkoutFormData = {
    title: workout.title,
    description: workout.description ?? "",
    category: workout.category,
    difficulty: workout.difficulty,
    estimatedDuration: workout.estimatedDuration,
    tags: workout.tags ?? [],
    isTemplate: workout.isTemplate,

    // ✅ Safely extract _id or id whether populated as an object or returned as a string
    exercises: (workout.exercises || []).map((item) => ({
      exercise:
        typeof item.exercise === "string"
          ? item.exercise
          : item.exercise?._id || item.exercise?.id || "",
      sets: item.sets,
      reps: item.reps,
      restSeconds: item.restSeconds,
      notes: item.notes ?? "",
      order: item.order,
    })),
  };

  /* -------------------------------------------------------------------------- */
  /*                            MAIN EDIT WORKSPACE                             */
  /* -------------------------------------------------------------------------- */
  return (
    <section className="space-y-8 animate-in fade-in duration-300 text-foreground">
      {/* ===================================================================== */}
      {/*                   TOP BREADCRUMB & HEADER SECTION                     */}
      {/* ===================================================================== */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {/* Back Navigation & Status Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/workouts/${workoutId}`)}
              className="-ml-2.5 h-8 text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>

            <span className="text-border/60 hidden sm:inline-block">|</span>

            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary flex items-center gap-1.5 shadow-[0_0_12px_rgba(91,229,132,0.1)]"
            >
              <Pencil className="h-3 w-3" />
              Editing Mode
            </Badge>

            <Badge
              variant="outline"
              className="border-border/60 text-muted-foreground font-mono text-[11px]"
            >
              ID: {workoutId?.slice(0, 8)}...
            </Badge>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Edit Routine:{" "}
              <span className="text-primary font-normal">{workout.title}</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Modify your training parameters, adjust target rest intervals, or
              re-order sequence movements below.
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/*                         RIGHT METADATA CHIPS                        */}
        {/* ===================================================================== */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto pt-2 lg:pt-0">
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>Active Template</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zod Validated</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/*                      WORKOUT BUILDER WORKSPACE                        */}
      {/* ===================================================================== */}
      <div className="relative">
        <WorkoutBuilder
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </section>
  );
}
