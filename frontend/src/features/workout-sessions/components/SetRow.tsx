import React, { useState, useEffect } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import type {
  WorkoutSetLog,
  PreviousSetPerformance,
} from "../types/workout-session.types";
import { useUpdateWorkoutSet } from "../hooks/useUpdateWorkoutSet";

interface SetRowProps {
  set: WorkoutSetLog;
  previousSet?: PreviousSetPerformance;
  targetRestSeconds?: number;
  stageLabel?: string;
  stageBadge?: string;
  onSetCompleted?: (restSeconds?: number) => void;
  onDelete?: () => void;
  onDeleteStage?: () => void;
  isDeleting?: boolean;
  isDeletingStage?: boolean;
  isChild?: boolean;
  hasChildren?: boolean;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  previousSet,
  targetRestSeconds = 60,
  stageLabel,
  stageBadge,
  onSetCompleted,
  onDelete,
  onDeleteStage,
  isDeleting = false,
  isDeletingStage = false,
  isChild = false,
  hasChildren = false,
}) => {
  const [weightInput, setWeightInput] = useState<string>(() => {
    if (set.weight > 0) return String(set.weight);
    if (previousSet?.weight) return String(previousSet.weight);
    return "";
  });

  const [repsInput, setRepsInput] = useState<string>(() => {
    if (set.actualReps > 0) return String(set.actualReps);
    if (previousSet?.actualReps) return String(previousSet.actualReps);
    const parsedTarget = parseInt(set.targetReps || "10", 10);
    return String(isNaN(parsedTarget) ? 10 : parsedTarget);
  });

  useEffect(() => {
    if (set.weight > 0) setWeightInput(String(set.weight));
    if (set.actualReps > 0) setRepsInput(String(set.actualReps));
  }, [set.weight, set.actualReps]);

  const isCompleted = set.completed;
  const { mutate: updateSet, isPending } = useUpdateWorkoutSet();

  const handleToggleComplete = () => {
    const nextCompleted = !isCompleted;
    const finalWeight =
      weightInput.trim() === "" ? 0 : Number(weightInput) || 0;
    const finalReps =
      repsInput.trim() === "" ? 0 : parseInt(repsInput, 10) || 0;

    updateSet(
      {
        id: set.id,
        payload: {
          weight: finalWeight,
          actualReps: finalReps,
          completed: nextCompleted,
          restDuration: targetRestSeconds,
        },
      },
      {
        onSuccess: () => {
          // Drop Sets / Break Sets / Rest-Pause compatibility:
          // Intermediate segments must NEVER trigger standard rest timer;
          // only the final segment starts the configured timer!
          const isIntermediate =
            Boolean(set.isIntermediateSegment) || set.isFinalSegment === false;

          if (nextCompleted && !isIntermediate && onSetCompleted) {
            onSetCompleted(targetRestSeconds);
          }
        },
      },
    );
  };

  const isSegment = (set.segmentIndex ?? 0) > 0 || isChild;
  const displaySetSeq = `${set.setNumber}.${set.segmentIndex ?? 0}`;
  const handleDeleteClick = onDelete || onDeleteStage;
  const isDeletingActive = isDeleting || isDeletingStage;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-[#5BE584]/5 border-[#5BE584]/25 shadow-[0_0_15px_rgba(91,229,132,0.04)]"
          : isSegment
            ? "bg-[#090B0F]/90 border-amber-500/20 hover:border-amber-500/35"
            : "bg-[#090B0F]/70 border-white/5 hover:border-white/10"
      }`}
    >
      {/* =======================================================================
          MOBILE VIEW (< sm): Clean, touch-optimized, compact 2-row layout.
          Prevents horizontal compression and guarantees Reps is 100% visible & editable.
         ======================================================================= */}
      <div className="flex flex-col gap-2 p-2.5 sm:hidden">
        {/* Row 1: Set Number, Badges, Target, & Previous Performance */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#101418] border ${
                isCompleted
                  ? "text-[#5BE584] border-[#5BE584]/30"
                  : isSegment
                    ? "text-amber-400 border-amber-500/30"
                    : "text-[#9CA3AF] border-[#1E2329]"
              }`}
            >
              Set {displaySetSeq}
            </span>

            {stageBadge ? (
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold border ${
                  isSegment
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : hasChildren
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-white/10 text-white/80 border-white/20"
                }`}
              >
                {stageBadge}
              </span>
            ) : isSegment ? (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Break {set.segmentIndex}
              </span>
            ) : hasChildren ? (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Parent
              </span>
            ) : set.setType && set.setType !== "NORMAL" ? (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {set.setType === "DROP_SET"
                  ? "Drop"
                  : set.setType === "REST_PAUSE"
                    ? "RP"
                    : "Warm"}
              </span>
            ) : null}

            <span className="text-[11px] text-[#9CA3AF] font-mono whitespace-nowrap">
              Target: <span className="font-semibold text-white">{set.targetReps || "10"}</span>
            </span>
          </div>

          {/* Previous Performance: compact pill if available, omitted if not (NO "First time" text) */}
          {previousSet && (
            <div className="shrink-0">
              <span className="font-mono text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                Prev: {previousSet.weight}kg × {previousSet.actualReps}
              </span>
            </div>
          )}
        </div>

        {stageLabel && (
          <div className="text-[10px] text-[#9CA3AF] font-medium truncate -mt-0.5">
            {stageLabel}
          </div>
        )}

        {/* Row 2: Weight Input, Reps Input, and Action Buttons */}
        <div className="flex items-end gap-2">
          {/* Weight Field */}
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              Weight (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onBlur={() => {
                  if (weightInput.trim() !== "") {
                    const num = Number(weightInput);
                    if (!isNaN(num)) setWeightInput(String(num));
                  }
                }}
                placeholder="0"
                disabled={isCompleted || isPending}
                aria-label={`Set ${displaySetSeq} Weight in kg`}
                className="w-full bg-[#101418] border border-[#1E2329] rounded-xl h-10 px-2.5 text-center text-sm font-semibold font-mono text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          {/* Reps Field - Always fully visible, labeled, and editable */}
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              Reps
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
                onBlur={() => {
                  if (repsInput.trim() !== "") {
                    const num = parseInt(repsInput, 10);
                    if (!isNaN(num)) setRepsInput(String(num));
                  }
                }}
                placeholder="0"
                disabled={isCompleted || isPending}
                aria-label={`Set ${displaySetSeq} Reps`}
                className="w-full bg-[#101418] border border-[#1E2329] rounded-xl h-10 px-2.5 text-center text-sm font-semibold font-mono text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {handleDeleteClick && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={isDeletingActive}
                title={
                  isSegment
                    ? `Remove Break Set ${displaySetSeq}`
                    : hasChildren
                      ? `Remove Set ${displaySetSeq} and its break sets`
                      : `Remove Set ${displaySetSeq}`
                }
                aria-label={`Remove Set ${displaySetSeq}`}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#101418] text-[#9CA3AF] border border-[#1E2329] hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-colors shrink-0"
              >
                {isDeletingActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={isPending}
              title={
                isCompleted ? "Click to uncheck or edit set" : "Mark set complete"
              }
              aria-label={
                isCompleted
                  ? `Mark Set ${displaySetSeq} incomplete`
                  : `Mark Set ${displaySetSeq} complete`
              }
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
                isCompleted
                  ? "bg-[#5BE584] text-[#090B0F] shadow-[0_0_12px_rgba(91,229,132,0.3)] hover:bg-[#4ade80]"
                  : "bg-[#101418] text-[#9CA3AF] border border-[#1E2329] hover:border-[#5BE584] hover:text-[#5BE584]"
              }`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCompleted ? (
                <Check className="h-4 w-4 stroke-[3]" />
              ) : (
                <Check className="h-4 w-4 stroke-[2]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          DESKTOP VIEW (>= sm): Preserved 12-column grid layout.
         ======================================================================= */}
      <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 sm:px-4 sm:py-3 sm:items-center">
        {/* Set Number & Stage Role */}
        <div className="col-span-2 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-mono text-xs font-bold ${
                isCompleted
                  ? "text-[#5BE584]"
                  : isSegment
                    ? "text-amber-400"
                    : "text-[#9CA3AF]"
              }`}
            >
              {displaySetSeq}
            </span>

            {stageBadge ? (
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold border ${
                  isSegment
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : hasChildren
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-white/10 text-white/80 border-white/20"
                }`}
              >
                {stageBadge}
              </span>
            ) : isSegment ? (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Break {set.segmentIndex}
              </span>
            ) : hasChildren ? (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Parent
              </span>
            ) : set.setType && set.setType !== "NORMAL" ? (
              <span className="text-[9px] uppercase px-1 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {set.setType === "DROP_SET"
                  ? "Drop"
                  : set.setType === "REST_PAUSE"
                    ? "RP"
                    : "Warm"}
              </span>
            ) : null}
          </div>

          {stageLabel && (
            <span className="text-[10px] text-[#9CA3AF] font-medium truncate mt-0.5">
              {stageLabel}
            </span>
          )}
        </div>

        {/* Target Prescribed */}
        <div className="col-span-2 flex flex-col">
          <span className="text-xs font-medium text-[#9CA3AF] font-mono">
            {set.targetReps || "10"}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#6B7280]">
            Target
          </span>
        </div>

        {/* Previous Performance (NO "First time" text) */}
        <div className="col-span-3">
          {previousSet ? (
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block w-fit">
                {previousSet.weight} kg × {previousSet.actualReps}
              </span>
              <span className="text-[9px] text-[#6B7280] uppercase tracking-wider mt-0.5">
                Previous
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#6B7280] font-mono">—</span>
          )}
        </div>

        {/* Current Weight Input */}
        <div className="col-span-2">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={() => {
                if (weightInput.trim() !== "") {
                  const num = Number(weightInput);
                  if (!isNaN(num)) setWeightInput(String(num));
                }
              }}
              placeholder="0"
              disabled={isCompleted || isPending}
              aria-label={`Set ${displaySetSeq} Weight in kg`}
              className="w-full min-w-0 bg-[#101418] border border-[#1E2329] rounded-xl py-2 px-3 text-center text-sm font-semibold font-mono text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280] font-mono uppercase pointer-events-none">
              kg
            </span>
          </div>
        </div>

        {/* Current Reps Input & Toggle Complete Button */}
        <div className="col-span-3 flex items-center gap-2 justify-end">
          <div className="relative flex-1 min-w-0 max-w-[75px]">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              onBlur={() => {
                if (repsInput.trim() !== "") {
                  const num = parseInt(repsInput, 10);
                  if (!isNaN(num)) setRepsInput(String(num));
                }
              }}
              placeholder="0"
              disabled={isCompleted || isPending}
              aria-label={`Set ${displaySetSeq} Reps`}
              className="w-full min-w-0 bg-[#101418] border border-[#1E2329] rounded-xl py-2 px-3 text-center text-sm font-semibold font-mono text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280] font-mono uppercase pointer-events-none">
              reps
            </span>
          </div>

          {handleDeleteClick && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeletingActive}
              title={
                isSegment
                  ? `Remove Break Set ${displaySetSeq}`
                  : hasChildren
                    ? `Remove Set ${displaySetSeq} and its break sets`
                    : `Remove Set ${displaySetSeq}`
              }
              aria-label={`Remove Set ${displaySetSeq}`}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#101418] text-[#9CA3AF] border border-[#1E2329] hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-colors shrink-0"
            >
              {isDeletingActive ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleComplete}
            disabled={isPending}
            title={
              isCompleted ? "Click to uncheck or edit set" : "Mark set complete"
            }
            aria-label={
              isCompleted
                ? `Mark Set ${displaySetSeq} incomplete`
                : `Mark Set ${displaySetSeq} complete`
            }
            className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all shrink-0 cursor-pointer ${
              isCompleted
                ? "bg-[#5BE584] text-[#090B0F] shadow-[0_0_12px_rgba(91,229,132,0.3)] hover:bg-[#4ade80]"
                : "bg-[#101418] text-[#9CA3AF] border border-[#1E2329] hover:border-[#5BE584] hover:text-[#5BE584]"
            }`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isCompleted ? (
              <Check className="h-4 w-4 stroke-[3]" />
            ) : (
              <Check className="h-4 w-4 stroke-[2]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetRow;
