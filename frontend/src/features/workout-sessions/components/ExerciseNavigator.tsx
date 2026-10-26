import React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
} from "lucide-react";
import type { WorkoutExerciseLog } from "../types/workout-session.types";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

interface ExerciseNavigatorProps {
  exerciseLogs: WorkoutExerciseLog[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  isAllView: boolean;
  onToggleAllView: () => void;
}

export const ExerciseNavigator: React.FC<ExerciseNavigatorProps> = ({
  exerciseLogs,
  currentIndex,
  onSelectIndex,
  isAllView,
  onToggleAllView,
}) => {
  const total = exerciseLogs.length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#1E2329] bg-[#101418] p-3 sm:p-4 backdrop-blur-sm">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Exercise Sequence
          </span>
          <span className="rounded-md bg-[#1E2329] px-2 py-0.5 text-[10px] font-mono font-bold text-white">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
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
          const isCompleted = log.completed;

          return (
            <button
              key={log.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`flex items-center gap-2.5 shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium border transition-all ${
                isSelected
                  ? "border-[#5BE584] bg-[#16291D] text-white shadow-sm"
                  : isCompleted
                    ? "border-[#23422E] bg-[#16291D]/50 text-emerald-300"
                    : "border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:text-white hover:border-[#2A313A]"
              }`}
            >
              <ExerciseImage
                src={log.exercise?.imageUrl}
                alt={log.exerciseName}
                size="xs"
                fit="contain"
              />
              <span className="font-mono text-[11px] font-bold opacity-75">
                {(idx + 1).toString().padStart(2, "0")}
              </span>
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {log.exerciseName}
              </span>
              {isCompleted && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseNavigator;
