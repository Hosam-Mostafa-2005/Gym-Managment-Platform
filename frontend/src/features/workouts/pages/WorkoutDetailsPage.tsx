import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Layers,
  Sparkles,
  Pencil,
  Trash2,
  Play,
  Calendar,
  User,
  ListOrdered,
  AlertCircle,
} from "lucide-react";

import { useWorkout } from "@/features/workouts/hooks/useWorkout";
import type { WorkoutExerciseDetails } from "@/features/workouts/types/workout.types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkoutDetailsPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  // Fetch workout data using your custom query hook
  const { data: workout, isLoading, isError } = useWorkout(workoutId || "");

  /* -------------------------------------------------------------------------- */
  /*                             LOADING SKELETON                               */
  /* -------------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <section className="space-y-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-border/40 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-lg bg-card/40 animate-pulse" />
            <div className="h-4 w-96 rounded-lg bg-card/20 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-lg bg-card/40 animate-pulse" />
            <div className="h-10 w-32 rounded-lg bg-card/40 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border/40 bg-card/20 animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-xl border border-border/40 bg-card/20 animate-pulse" />
      </section>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              ERROR / NOT FOUND                             */
  /* -------------------------------------------------------------------------- */
  if (isError || !workout) {
    return (
      <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/10 p-16 text-center animate-in fade-in duration-300">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Workout Not Found
        </h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          The workout routine you are looking for does not exist or has been
          archived.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/workouts")}
          className="mt-6 border-border/60 hover:bg-accent/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Library
        </Button>
      </section>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                             MAIN DETAILS VIEW                              */
  /* -------------------------------------------------------------------------- */
  return (
    <section className="space-y-8 animate-in fade-in duration-300 text-foreground">
      {/* ===================================================================== */}
      {/*                   TOP NAVIGATION & ACTION HEADER                      */}
      {/* ===================================================================== */}
      <div className="flex flex-col gap-6 border-b border-border/40 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 max-w-3xl">
          {/* Breadcrumb & Status Badges */}
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
              className="border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize flex items-center gap-1.5 shadow-[0_0_12px_rgba(91,229,132,0.1)]"
            >
              <Sparkles className="h-3 w-3 animate-pulse" />
              {workout.category}
            </Badge>

            <Badge
              variant="outline"
              className="border-border/60 text-muted-foreground capitalize font-normal text-xs"
            >
              {workout.difficulty}
            </Badge>

            {workout.isTemplate && (
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400/80 font-normal text-xs flex items-center gap-1"
              >
                <Layers className="h-3 w-3" /> Template
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {workout.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workout.description ||
                "No detailed description provided for this workout routine."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end lg:self-start">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Delete Workout"
            onClick={() => {
              // Add delete handler dialog here if needed
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/workouts/${workoutId}/edit`)}
            className="border-border/60 bg-card/30 hover:bg-card/80 text-foreground"
          >
            <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
            Edit Routine
          </Button>

          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Session
          </Button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/*                       METADATA OVERVIEW CARDS                         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Estimated Duration
              </p>
              <p className="text-lg font-bold text-foreground">
                ~{workout.estimatedDuration} mins
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Exercises
              </p>
              <p className="text-lg font-bold text-foreground">
                {workout.exercises?.length || 0} Movements
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground border border-border/60">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Created By
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {workout.createdBy?.name || "System Admin"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground border border-border/60">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm font-semibold text-foreground">
                {workout.updatedAt
                  ? new Date(workout.updatedAt).toLocaleDateString()
                  : "Recently"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===================================================================== */}
      {/*                      EXERCISE SEQUENCE TABLE                          */}
      {/* ===================================================================== */}
      <Card className="border-border/60 bg-card/20 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <ListOrdered className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Sequence Details
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            ID: {workout.id}
          </span>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {!workout.exercises || workout.exercises.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
              No exercises have been configured for this workout sequence yet.
            </div>
          ) : (
            <div className="divide-y divide-border/40 rounded-xl border border-border/50 bg-card/30 overflow-hidden">
              {workout.exercises.map(
                (item: WorkoutExerciseDetails, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-card/60 transition-colors"
                  >
                    {/* Index & Exercise Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 border border-border/60 text-xs font-bold text-muted-foreground">
                        {item.order || idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-foreground">
                          {item.exercise?.name || "Custom Exercise"}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.exercise?.equipment || "Barbell"} •{" "}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-primary/80 bg-primary/5 border border-primary/10 rounded px-2 py-1 mt-2 inline-block">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Target Parameters Grid */}
                    <div className="grid grid-cols-3 gap-6 self-end sm:self-center bg-background/40 border border-border/40 rounded-lg px-4 py-2 text-center sm:text-right">
                      <div>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Sets
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {item.sets}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Reps
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {item.reps}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Rest
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          {item.restSeconds}s
                        </span>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
