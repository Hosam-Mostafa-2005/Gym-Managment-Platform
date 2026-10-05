import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  ShieldCheck,
  AlertCircle,
  Pencil,
  Loader2,
} from "lucide-react";

import WorkoutBuilder from "../components/WorkoutForm";
import { useWorkout } from "../hooks/useWorkout";
import { useUpdateWorkout } from "../hooks/useUpdateWorkout";
import type { WorkoutFormData } from "../schemas/workout.schema";

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

    updateWorkout(
      {
        id: workoutId,
        data,
      },
      {
        onSuccess: () => {
          navigate(`/workout-builder/${workoutId}`);
        },
        onError: (err) => {
          console.log("Mutation error response:", err);
        },
      },
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                LOADING SKELETON                            */
  /* -------------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24 flex flex-col items-center justify-center text-[#6B7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="mt-4 text-sm font-medium">Loading workout editor...</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               ERROR / NOT FOUND                            */
  /* -------------------------------------------------------------------------- */
  if (isError || !workout) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24">
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-12 text-center backdrop-blur-sm max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400 border border-red-900/50 mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Workout Not Found
            </h2>
            <p className="mt-2 text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              We could not load the details for this workout routine. It may
              have been deleted or archived.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => navigate("/workout-builder")}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Library
              </button>
              {workoutId && (
                <button
                  onClick={() => navigate(`/workout-builder/${workoutId}`)}
                  className="inline-flex items-center justify-center rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80]"
                >
                  View Details Page
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            {/* Breadcrumb & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/workout-builder/${workoutId}`)}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                Back to Details
              </button>

              <span className="text-[#1E2329]">/</span>

              <span className="inline-flex items-center gap-1 rounded bg-[#16291D] border border-[#23422E] px-2.5 py-0.5 text-[11px] font-medium text-[#5BE584]">
                <Pencil className="h-3 w-3" />
                Editing Mode
              </span>

              <span className="inline-flex items-center rounded bg-[#1E2329] px-2.5 py-0.5 text-[11px] font-mono text-[#9CA3AF]">
                ID: {workoutId?.slice(0, 8)}...
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Edit Routine:{" "}
                <span className="text-[#5BE584] font-normal">
                  {workout.title}
                </span>
              </h1>
              <p className="text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
                Modify your training parameters, adjust target rest intervals,
                or re-order sequence movements below.
              </p>
            </div>
          </div>

          {/* Right Metadata Chips */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto pt-2 lg:pt-0">
            <div className="flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#101418] px-3.5 py-1.5 text-xs font-medium text-[#9CA3AF] backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Active Template</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3.5 py-1.5 text-xs font-medium text-[#9CA3AF] backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Zod Validated</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 animate-in fade-in duration-300">
        <WorkoutBuilder
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}
