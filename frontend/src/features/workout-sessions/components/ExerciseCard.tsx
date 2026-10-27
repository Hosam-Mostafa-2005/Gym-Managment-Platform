import React, { useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Dumbbell,
  ExternalLink,
  History,
  Info,
  Loader2,
  PlayCircle,
  Plus,
  Target,
} from "lucide-react";
import type {
  WorkoutExerciseLog,
  PreviousExercisePerformance,
} from "../types/workout-session.types";
import { SetRow } from "./SetRow";
import { useCreateWorkoutSet } from "../hooks/useCreateWorkoutSet";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

export interface ExerciseCardProps {
  exercise: WorkoutExerciseLog;
  previousPerformance?: PreviousExercisePerformance | null;
  onSetCompleted?: (restSeconds?: number) => void;
  isFocused?: boolean;
  showConnector?: boolean;
  children?: ReactNode;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  previousPerformance,
  onSetCompleted,
  isFocused = false,
  showConnector = false,
  children,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const { mutate: createSet, isPending: isCreatingSet } = useCreateWorkoutSet();

  const sets = exercise.sets || [];
  const totalSets = sets.length || exercise.targetSets || 0;
  const completedSetsCount = sets.filter((s) => s.completed).length;
  const isExerciseDone =
    exercise.completed ||
    (sets.length > 0 && completedSetsCount === sets.length);

  const exerciseDetails = exercise.exercise;
  const exerciseImage = exerciseDetails?.imageUrl || null;
  const primaryMuscles = exerciseDetails?.primaryMuscles || [];
  const secondaryMuscles = exerciseDetails?.secondaryMuscles || [];
  const equipment = exerciseDetails?.equipment || [];
  const instructions = exerciseDetails?.instructions || [];
  const tips = exerciseDetails?.tips || [];
  const videoUrl = exerciseDetails?.videoUrl;

  const bestSet =
    exercise.previousBestSet ||
    previousPerformance?.bestSet ||
    (previousPerformance?.sets && previousPerformance.sets.length > 0
      ? [...previousPerformance.sets].sort((a, b) =>
          b.weight !== a.weight ? b.weight - a.weight : b.actualReps - a.actualReps,
        )[0]
      : null);

  const handleAddExtraSet = () => {
    const nextSetNumber = sets.length + 1;
    const lastSet = sets[sets.length - 1];
    createSet({
      exerciseLog: exercise.id,
      setNumber: nextSetNumber,
      targetReps: exercise.targetReps || "10",
      actualReps: lastSet?.actualReps || 10,
      weight: lastSet?.weight || 0,
    });
  };

  return (
    <div className="relative">
      <section
        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
          isExerciseDone
            ? "border-[#23422E] bg-[#101418]/95 shadow-[0_0_25px_rgba(91,229,132,0.06)]"
            : isFocused
              ? "border-[#5BE584]/35 bg-[#101418] shadow-xl"
              : "border-[#1E2329] bg-[#101418] shadow-lg"
        }`}
      >
        {/* =====================================================================
            EXERCISE HEADER: Movement Details on Left, Clean White Image on Right
           ===================================================================== */}
        <div className="p-4 sm:p-6 border-b border-[#1E2329]">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            {/* LEFT: Exercise Identity, Target Sets/Reps, Muscles & Equipment */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Order Badge & Completion Status */}
              <div className="flex flex-wrap items-center gap-2">
                {typeof exercise.order === "number" && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      isExerciseDone
                        ? "bg-[#16291D] text-[#5BE584] border border-[#23422E]"
                        : "bg-[#1E2329] text-[#9CA3AF]"
                    }`}
                  >
                    Movement {exercise.order.toString().padStart(2, "0")}
                  </span>
                )}

                <span className="inline-flex items-center rounded-md border border-[#262D36] bg-[#141920] px-2.5 py-0.5 text-[11px] font-mono font-semibold text-white">
                  {completedSetsCount} / {totalSets} Sets Done
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isExerciseDone
                      ? "border-[#5BE584]/30 bg-[#5BE584]/10 text-[#5BE584]"
                      : "border-[#1E2329] bg-[#090B0F] text-[#9CA3AF]"
                  }`}
                >
                  {isExerciseDone ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  {isExerciseDone ? "Completed" : "In Progress"}
                </span>
              </div>

              {/* Exercise Name & Target Prescription */}
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  {exercise.exerciseName}
                </h2>
                <div className="mt-1 text-xs sm:text-sm font-medium text-[#9CA3AF] flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <Dumbbell className="h-3.5 w-3.5 text-[#5BE584]" />
                    <span>
                      Target:{" "}
                      <strong className="text-white font-semibold">
                        {exercise.targetSets} Sets × {exercise.targetReps} Reps
                      </strong>
                    </span>
                  </span>

                  {exercise.targetWeight != null && exercise.targetWeight > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#16291D] border border-[#23422E] text-[11px] font-mono text-[#5BE584] font-semibold">
                      Target Load: {exercise.targetWeight} kg
                    </span>
                  )}

                  {exercise.targetRpe != null && exercise.targetRpe > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#1E2329] text-[11px] font-mono text-[#E5E7EB] font-semibold">
                      Target RPE {exercise.targetRpe}
                    </span>
                  )}
                </div>
              </div>

              {/* Target Muscles & Equipment Pills */}
              {(primaryMuscles.length > 0 ||
                secondaryMuscles.length > 0 ||
                equipment.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {primaryMuscles.map((muscle) => (
                    <span
                      key={`prim-${muscle}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#5BE584]/30 bg-[#5BE584]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#5BE584]"
                    >
                      <Target className="h-2.5 w-2.5" />
                      {muscle}
                    </span>
                  ))}

                  {secondaryMuscles.slice(0, 2).map((muscle) => (
                    <span
                      key={`sec-${muscle}`}
                      className="inline-flex items-center rounded-lg border border-[#1E2329] bg-[#090B0F] px-2 py-0.5 text-[11px] font-medium text-[#9CA3AF]"
                    >
                      {muscle}
                    </span>
                  ))}

                  {equipment.map((eq) => (
                    <span
                      key={`eq-${eq}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#262D36] bg-[#141920] px-2.5 py-0.5 text-[11px] font-medium text-[#E5E7EB]"
                    >
                      <Dumbbell className="h-2.5 w-2.5 text-[#9CA3AF]" />
                      {eq}
                    </span>
                  ))}
                </div>
              )}

              {/* Previous Session Benchmark + Form Guide / Video Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {bestSet && bestSet.weight > 0 ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#5BE584]/25 bg-[#16291D]/60 px-3 py-1.5 text-[11px] text-[#9CA3AF]">
                    <History className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
                    <span>Best previous set:</span>
                    <span className="font-mono font-bold text-white">
                      {bestSet.weight} kg × {bestSet.actualReps} reps
                    </span>
                  </div>
                ) : previousPerformance ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] text-[#9CA3AF]">
                    <History className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
                    <span>Last Session:</span>
                    <span className="font-mono font-semibold text-white">
                      {previousPerformance.maxWeight ?? 0} kg max •{" "}
                      {previousPerformance.totalVolume ?? 0} kg vol
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-2.5 py-1 text-[11px] text-[#6B7280]">
                    <span>No previous performance yet</span>
                  </div>
                )}

                {(instructions.length > 0 || tips.length > 0) && (
                  <button
                    type="button"
                    onClick={() => setShowInstructions((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/40 hover:text-white transition-colors"
                  >
                    <Info className="h-3.5 w-3.5 text-[#5BE584]" />
                    <span>{showInstructions ? "Hide Cues" : "Form Guide"}</span>
                    {showInstructions ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}

                {videoUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#5BE584] hover:bg-[#16291D] hover:border-[#23422E] transition-colors"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Video Demo</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                )}
              </div>
            </div>

            {/* RIGHT: Clean White Framed Exercise Illustration / Photo */}
            <div className="self-stretch sm:self-center shrink-0">
              <ExerciseImage
                src={exerciseImage}
                alt={exercise.exerciseName}
                size="custom"
                fit="contain"
                className="h-44 w-full sm:h-32 sm:w-44 md:h-36 md:w-48 rounded-xl border-[#2A313A]"
              />
            </div>
          </div>

          {/* Expandable Instructions & Coaching Cues */}
          {showInstructions && (
            <div className="mt-4 rounded-xl border border-[#1E2329] bg-[#090B0F]/90 p-4 space-y-3 text-xs text-[#9CA3AF] animate-in fade-in duration-200">
              {instructions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white uppercase tracking-wider text-[10px] mb-1.5">
                    Step-by-Step Execution
                  </h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {instructions.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#5BE584] uppercase tracking-wider text-[10px] mb-1">
                    Pro Coaching Tips
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {tips.map((tip, i) => (
                      <li key={i} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================================
            SETS LOGGING LIST
           ===================================================================== */}
        <div className="p-4 sm:p-6 space-y-3">
          {children ? (
            <div>
              <div className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 pb-3 border-b border-white/5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                <div className="col-span-2">Set</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-3 text-center">kg</div>
                <div className="col-span-5">Reps</div>
              </div>
              <div className="mt-3 space-y-2">{children}</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 pb-2 border-b border-[#1E2329] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <div className="col-span-1">Set</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-3">Previous</div>
                <div className="col-span-3 text-center">Weight (kg)</div>
                <div className="col-span-3 text-right pr-11">Actual Reps</div>
              </div>

              <div className="space-y-2.5">
                {sets.map((set) => {
                  const prevSet = previousPerformance?.sets?.find(
                    (ps) => ps.setNumber === set.setNumber,
                  );
                  return (
                    <SetRow
                      key={set.id}
                      set={set}
                      previousSet={prevSet}
                      onSetCompleted={onSetCompleted}
                    />
                  );
                })}
              </div>

              {/* Add Extra Set Action */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddExtraSet}
                  disabled={isCreatingSet}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#2A313A] bg-[#090B0F]/60 px-3.5 py-2 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/50 hover:text-[#5BE584] transition-colors disabled:opacity-50"
                >
                  {isCreatingSet ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Add Set</span>
                </button>

                {isExerciseDone && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5BE584]">
                    <CheckCircle2 className="h-4 w-4" />
                    All Prescribed Sets Logged
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {showConnector && (
        <div className="mx-auto h-6 w-0.5 bg-gradient-to-b from-[#2A313A] to-transparent" />
      )}
    </div>
  );
};

export default ExerciseCard;
