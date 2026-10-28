import React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Plus,
} from "lucide-react";
import type { WorkoutExerciseLog } from "../types/workout-session.types";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

interface ExerciseNavigatorProps {
  exerciseLogs: WorkoutExerciseLog[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  isAllView: boolean;
  onToggleAllView: () => void;
  onAddExercise?: () => void;
}

export const ExerciseNavigator: React.FC<ExerciseNavigatorProps> = ({
  exerciseLogs,
  currentIndex,
  onSelectIndex,
  isAllView,
  onToggleAllView,
  onAddExercise,
}) => {
  const total = exerciseLogs.length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#1E2329] bg-[#101418] p-3 sm:p-4 backdrop-blur-sm">
      {/* Top Header Controls */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Exercise Sequence
          </span>
          <span className="rounded-md bg-[#1E2329] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAddExercise && (
            <button
              type="button"
              onClick={onAddExercise}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#5BE584]/40 bg-[#5BE584]/10 px-3 py-1.5 text-xs font-semibold text-[#5BE584] hover:bg-[#5BE584]/20 hover:border-[#5BE584]/60 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Exercise</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleAllView}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              isAllView
                ? "border-[#5BE584] bg-[#16291D] text-[#5BE584]"
                : "border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:text-white"
            }`}
          >
            {isAllView ? (
              <LayoutGrid className="h-3.5 w-3.5" />
            ) : (
              <List className="h-3.5 w-3.5" />
            )}
            <span>{isAllView ? "Focus Mode" : "Show All"}</span>
          </button>

          {!isAllView && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="rounded-lg border border-[#1E2329] bg-[#090B0F] p-1.5 text-[#9CA3AF] hover:text-white hover:border-[#2A313A] disabled:opacity-30 transition-colors"
                title="Previous Exercise"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onSelectIndex(Math.min(total - 1, currentIndex + 1))
                }
                disabled={currentIndex === total - 1}
                className="rounded-lg border border-[#1E2329] bg-[#090B0F] p-1.5 text-[#9CA3AF] hover:text-white hover:border-[#2A313A] disabled:opacity-30 transition-colors"
                title="Next Exercise"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Movement Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {exerciseLogs.map((log, idx) => {
          const isSelected = !isAllView && idx === currentIndex;
          const isCompleted =
            log.completed ||
            (log.sets && log.sets.length > 0 && log.sets.every((s) => s.completed));

          return (
            <button
              key={log.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`flex items-center gap-2.5 shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${
                isSelected
                  ? "border-[#5BE584] bg-[#16291D] text-white shadow-sm"
                  : isCompleted
                    ? "border-[#23422E] bg-[#101418] text-[#5BE584] hover:border-[#5BE584]/40"
                    : "border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:text-white hover:border-[#2A313A]"
              }`}
            >
              <ExerciseImage
                src={log.exercise?.imageUrl}
                alt={log.exercise?.name || "Exercise"}
                size="sm"
                fit="contain"
                className="h-6 w-6 rounded-md shrink-0 border-[#2A313A]"
              />

              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                {log.exercise?.name || log.exerciseName || `Exercise #${idx + 1}`}
              </span>

              {isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#5BE584]" />
              ) : (
                <span className="text-[10px] text-[#6B7280] font-mono">
                  {log.sets?.filter((s) => s.completed).length || 0}/
                  {log.targetSets || log.sets?.length || 0}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Add Pill at end of list */}
        {onAddExercise && (
          <button
            type="button"
            onClick={onAddExercise}
            className="flex items-center gap-1.5 shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium border border-dashed border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#5BE584]/50 hover:text-[#5BE584] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default ExerciseNavigator;
