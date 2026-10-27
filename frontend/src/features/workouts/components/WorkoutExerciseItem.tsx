import { Trash2, ChevronUp, ChevronDown, GripVertical, Target, Dumbbell } from "lucide-react";
import { useWatch, type Control } from "react-hook-form";

import type { Exercise } from "@/features/exercises/types/exercise.types";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";
import type { CreateWorkoutPayload } from "../types/workout.types";

import {
  FormCombobox,
  FormInput,
  FormNumberInput,
  FormTextarea,
} from "@/components/form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface WorkoutExerciseItemProps {
  index: number;
  control: Control<CreateWorkoutPayload>;
  exercises: Exercise[];
  remove: (index: number) => void;
  move?: (fromIndex: number, toIndex: number) => void;
  total?: number;
}

export default function WorkoutExerciseItem({
  index,
  control,
  exercises,
  remove,
  move,
  total = 0,
}: WorkoutExerciseItemProps) {
  const selectedExerciseId = useWatch({
    control,
    name: `exercises.${index}.exercise`,
  });

  const selectedExercise = exercises.find(
    (ex) => (ex._id || ex.id) === selectedExerciseId,
  );

  return (
    <Card className="group relative border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-200 hover:border-border/80 hover:bg-card/50 shadow-sm">
      {/* ===================================================================== */}
      {/*                    HEADER: BADGE & SEQUENCE CONTROLS                  */}
      {/* ===================================================================== */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-3 pt-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors hidden sm:block" />

          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-bold text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(91,229,132,0.1)]">
            #{index + 1}
          </span>

          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {selectedExercise ? selectedExercise.name : "Exercise Sequence"}
          </h3>
        </div>

        {/* Action Controls: Move Up, Move Down, Delete */}
        <div className="flex items-center gap-1">
          {move && (
            <div className="flex items-center rounded-lg border border-border/40 bg-background/40 p-0.5 mr-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:opacity-30"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                title="Move Up"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">Move Up</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:opacity-30"
                disabled={index >= total - 1}
                onClick={() => move(index, index + 1)}
                title="Move Down"
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Move Down</span>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => remove(index)}
            title="Remove Exercise"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove Exercise</span>
          </Button>
        </div>
      </CardHeader>

      {/* ===================================================================== */}
      {/*                      CONTENT: TARGET PARAMETERS                       */}
      {/* ===================================================================== */}
      <CardContent className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <FormCombobox
              control={control}
              name={`exercises.${index}.exercise`}
              label="Exercise Movement"
              items={exercises}
              getValue={(exercise) => exercise._id || exercise.id || ""}
              getLabel={(exercise) => exercise.name}
              placeholder="Select exercise..."
              searchPlaceholder="Search training library..."
              emptyMessage="No exercises found."
            />

            {selectedExercise && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {selectedExercise.primaryMuscles?.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-md border border-[#5BE584]/30 bg-[#5BE584]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5BE584]"
                  >
                    <Target className="h-2.5 w-2.5" />
                    {m}
                  </span>
                ))}
                {selectedExercise.equipment?.map((eq) => (
                  <span
                    key={eq}
                    className="inline-flex items-center gap-1 rounded-md border border-[#262D36] bg-[#141920] px-2 py-0.5 text-[10px] font-medium text-[#E5E7EB]"
                  >
                    <Dumbbell className="h-2.5 w-2.5 text-[#9CA3AF]" />
                    {eq}
                  </span>
                ))}
              </div>
            )}
          </div>

          {selectedExercise && (
            <ExerciseImage
              src={selectedExercise.imageUrl}
              alt={selectedExercise.name}
              size="lg"
              fit="contain"
            />
          )}
        </div>

        {/* Core Parameters: Sets, Reps, Rest */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border border-border/40 bg-background/20 p-3.5">
          <FormNumberInput
            control={control}
            name={`exercises.${index}.sets`}
            label="Target Sets"
            min={1}
          />

          <FormInput
            control={control}
            name={`exercises.${index}.reps`}
            label="Target Reps"
            placeholder="e.g. 8-10 or Failure"
          />

          <FormNumberInput
            control={control}
            name={`exercises.${index}.restSeconds`}
            label="Rest Interval (sec)"
            min={0}
          />
        </div>

        {/* Prescription Targets: Target Weight & Target RPE */}
        <div className="rounded-lg border border-border/40 bg-background/20 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prescription Targets (Optional)
            </span>
            <span className="text-[11px] text-muted-foreground/80">
              Coaching targets for member guidance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormNumberInput
              control={control}
              name={`exercises.${index}.targetWeight`}
              label="Target Load (kg)"
              placeholder="e.g. 80 or 82.5"
              min={0}
              step={0.5}
            />

            <FormNumberInput
              control={control}
              name={`exercises.${index}.targetRpe`}
              label="Target Exertion (RPE 1–10)"
              placeholder="e.g. 8"
              min={1}
              max={10}
              step={0.5}
            />
          </div>
        </div>

        <FormTextarea
          control={control}
          name={`exercises.${index}.notes`}
          label="Coaching Notes"
          placeholder="Add tempo, RPE targets, or execution cues..."
          rows={2}
          className="resize-none"
        />
      </CardContent>
    </Card>
  );
}
