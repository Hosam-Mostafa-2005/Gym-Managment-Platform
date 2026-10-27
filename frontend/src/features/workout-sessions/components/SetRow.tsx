import React, { useState, useEffect } from "react";
import { Check, Undo2, Loader2 } from "lucide-react";
import type {
  WorkoutSetLog,
  PreviousSetPerformance,
} from "../types/workout-session.types";
import { useUpdateWorkoutSet } from "../hooks/useUpdateWorkoutSet";

interface SetRowProps {
  set: WorkoutSetLog;
  previousSet?: PreviousSetPerformance;
  targetRestSeconds?: number;
  onSetCompleted?: (restSeconds?: number) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  previousSet,
  targetRestSeconds = 60,
  onSetCompleted,
}) => {
  const [weight, setWeight] = useState<number>(() => {
    if (set.weight > 0) return set.weight;
    if (previousSet?.weight) return previousSet.weight;
    return 0;
  });

  const [reps, setReps] = useState<number>(() => {
    if (set.actualReps > 0) return set.actualReps;
    if (previousSet?.actualReps) return previousSet.actualReps;
    const parsedTarget = parseInt(set.targetReps || "10", 10);
    return isNaN(parsedTarget) ? 10 : parsedTarget;
  });

  useEffect(() => {
    if (set.weight > 0) setWeight(set.weight);
    if (set.actualReps > 0) setReps(set.actualReps);
  }, [set.weight, set.actualReps]);

  const isCompleted = set.completed;
  const { mutate: updateSet, isPending } = useUpdateWorkoutSet();

  const handleToggleComplete = () => {
    const nextCompleted = !isCompleted;

    updateSet(
      {
        id: set.id,
        payload: {
          weight: Number(weight) || 0,
          actualReps: Number(reps) || 0,
          completed: nextCompleted,
          restDuration: targetRestSeconds,
        },
      },
      {
        onSuccess: () => {
          if (nextCompleted && onSetCompleted) {
            onSetCompleted(targetRestSeconds);
          }
        },
      },
    );
  };

  return (
    <div
      className={`grid grid-cols-12 gap-1.5 sm:gap-4 px-2 sm:px-4 py-2.5 sm:py-3 items-center rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-[#5BE584]/5 border-[#5BE584]/25 shadow-[0_0_15px_rgba(91,229,132,0.04)]"
          : "bg-[#090B0F]/70 border-white/5 hover:border-white/10"
      }`}
    >
      {/* Set Number */}
      <div className="col-span-1 sm:col-span-1">
        <span
          className={`font-mono text-xs font-bold ${
            isCompleted ? "text-[#5BE584]" : "text-[#9CA3AF]"
          }`}
        >
          #{set.setNumber}
        </span>
      </div>

      {/* Target Prescribed */}
      <div className="col-span-2 sm:col-span-2 flex flex-col">
        <span className="text-xs font-medium text-[#9CA3AF] font-mono">
          {set.targetReps || "10"}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[#6B7280]">
          Target
        </span>
      </div>

      {/* Previous Performance (Mandatory Requirement) */}
      <div className="col-span-3 sm:col-span-3">
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
          <span className="text-xs text-[#6B7280] font-mono italic">
            — First time
          </span>
        )}
      </div>

      {/* Current Weight Input */}
      <div className="col-span-3 sm:col-span-3">
        <div className="relative">
          <input
            type="number"
            min={0}
            step={0.5}
            value={weight === 0 ? "" : weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="0"
            disabled={isCompleted || isPending}
            className="w-full min-w-0 bg-[#101418] border border-[#1E2329] rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-1.5 sm:px-3 text-center text-xs sm:text-sm font-semibold font-mono text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
          />
          <span className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280] font-mono uppercase pointer-events-none">
            kg
          </span>
        </div>
      </div>

      {/* Current Reps Input & Toggle Complete Button */}
      <div className="col-span-3 sm:col-span-3 flex items-center gap-2 justify-end">
        <div className="relative flex-1 min-w-0 max-w-[80px]">
          <input
            type="number"
            min={0}
            value={reps === 0 ? "" : reps}
            onChange={(e) => setReps(Number(e.target.value))}
            placeholder="0"
            disabled={isCompleted || isPending}
            className="w-full min-w-0 bg-[#101418] border border-[#1E2329] rounded-lg sm:rounded-xl py-1.5 sm:py-2 px-1.5 sm:px-3 text-center text-xs sm:text-sm font-semibold font-mono text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
          />
          <span className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6B7280] font-mono uppercase pointer-events-none">
            reps
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleComplete}
          disabled={isPending}
          title={isCompleted ? "Click to uncheck or edit set" : "Mark set complete"}
          className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-all shrink-0 cursor-pointer ${
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
  );
};

export default SetRow;
