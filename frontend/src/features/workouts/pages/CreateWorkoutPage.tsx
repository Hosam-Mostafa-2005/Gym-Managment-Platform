import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Layers, ShieldCheck } from "lucide-react";

import WorkoutForm from "../components/WorkoutForm";
import { useCreateWorkout } from "../hooks/useCreateWorkout";
import type { WorkoutFormData } from "../schemas/workout.schema";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWorkout();

  function handleSubmit(data: WorkoutFormData) {
    mutate(data, {
      onSuccess: () => {
        navigate("/workouts");
      },
    });
  }

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
              onClick={() => navigate("/workouts")}
              className="-ml-2.5 h-8 text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workouts
            </Button>

            <span className="text-border/60 hidden sm:inline-block">|</span>

            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary flex items-center gap-1.5 shadow-[0_0_12px_rgba(91,229,132,0.1)]"
            >
              <Sparkles className="h-3 w-3 animate-pulse" />
              Template Creator
            </Badge>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create Workout Routine
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Design a structured training sequence by picking exercises from
              your library, configuring target sets, reps, and rest intervals.
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/*                         RIGHT METADATA CHIPS                        */}
        {/* ===================================================================== */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto pt-2 lg:pt-0">
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>Draft Mode</span>
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
        <WorkoutForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </section>
  );
}
