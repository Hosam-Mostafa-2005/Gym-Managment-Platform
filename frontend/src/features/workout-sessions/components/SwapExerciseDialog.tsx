import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeftRight,
  X,
  Search,
  Check,
  Dumbbell,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { useAllExercises } from "@/features/exercises/hooks/useExercises";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import { ALL_MUSCLE_CATEGORIES, doesExerciseMatchMuscle } from "@/features/exercises/constants/exercise.constants";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";
import { useSwapExercise } from "../hooks/useSwapExercise";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

export interface SwapExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  exerciseLog: WorkoutExerciseLog;
}

const COMMON_REASONS = [
  "Equipment unavailable",
  "Exercise causes discomfort / pain",
  "Exercise not suitable today",
  "Alternative variation preferred",
  "Other",
] as const;

export const SwapExerciseDialog: React.FC<SwapExerciseDialogProps> = ({
  isOpen,
  onClose,
  sessionId,
  exerciseLog,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");

  const { data: exercisesResponse, isLoading: isLoadingExercises } = useAllExercises();
  const { mutate: swapExercise, isPending: isSwapping } = useSwapExercise();

  const allExercises: Exercise[] = useMemo(() => {
    if (!exercisesResponse) return [];
    if (Array.isArray(exercisesResponse)) return exercisesResponse;
    const res = exercisesResponse as any;
    return res.exercises || res.data?.exercises || [];
  }, [exercisesResponse]);

  // Filter out the current exercise and match search/muscle filters
  const currentExId = exerciseLog.exercise?.id || exerciseLog.exerciseId;

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      // Exclude current exercise
      if (ex.id === currentExId) return false;

      const matchesSearch =
        !searchQuery.trim() ||
        ex.name?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchesMuscle = doesExerciseMatchMuscle(ex, selectedMuscle);

      return matchesSearch && matchesMuscle;
    });
  }, [allExercises, currentExId, searchQuery, selectedMuscle]);

  const selectedExercise = useMemo(
    () => allExercises.find((ex) => ex.id === selectedExerciseId),
    [allExercises, selectedExerciseId],
  );

  const completedSetsCount =
    exerciseLog.sets?.filter((s) => s.completed).length ?? 0;

  const handleConfirmSwap = () => {
    if (!selectedExerciseId) return;

    const finalReason =
      selectedReason === "Other" && customNotes.trim()
        ? customNotes.trim()
        : selectedReason;

    swapExercise(
      {
        sessionId,
        exerciseLogId: exerciseLog.id,
        payload: {
          newExerciseId: selectedExerciseId,
          reason: finalReason,
          notes: customNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          setSelectedExerciseId(null);
          setSearchQuery("");
          setCustomNotes("");
        },
      },
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Swap Exercise
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Replacing: <span className="text-white font-medium">{exerciseLog.exerciseName}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSwapping}
              className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100dvh-12rem)] overflow-y-auto flex-1 custom-scrollbar">
            {/* Preservation Safety Banner */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5 text-xs text-amber-200/90">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-300">
                  History & Log Safety
                </p>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  {completedSetsCount > 0 ? (
                    <>
                      <strong>{completedSetsCount} completed {completedSetsCount === 1 ? "set" : "sets"}</strong> will be preserved in your history. Remaining uncompleted sets will have their load set to 0 kg so you can safely calibrate the new movement.
                    </>
                  ) : (
                    "Remaining uncompleted sets will have their load initialized to 0 kg so you can log the replacement exercise safely."
                  )}
                </p>
              </div>
            </div>

            {/* Step 1: Search & Filter Replacement */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                1. Select Replacement Movement
              </label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search by exercise name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-9 pr-4 py-2 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                />
              </div>

              {/* Muscle Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALL_MUSCLE_CATEGORIES.map((muscle) => {
                  const isActive = selectedMuscle?.toLowerCase() === muscle.toLowerCase();
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() =>
                        setSelectedMuscle(isActive ? null : muscle)
                      }
                      className={`capitalize px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        isActive
                          ? "bg-[#5BE584] text-[#090B0F] font-semibold shadow-sm"
                          : "bg-[#101418] border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A]"
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>

              {/* Exercise Selection List */}
              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[#1E2329] bg-[#101418]/60 divide-y divide-[#1E2329]">
                {isLoadingExercises ? (
                  <div className="p-8 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#5BE584]" />
                    <span>Loading exercises...</span>
                  </div>
                ) : filteredExercises.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6B7280]">
                    No exercises match your search.
                  </div>
                ) : (
                  filteredExercises.map((ex) => {
                    const isSelected = selectedExerciseId === ex.id;
                    return (
                      <div
                        key={ex.id}
                        onClick={() => setSelectedExerciseId(ex.id)}
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#16291D]/80 border-l-2 border-[#5BE584]"
                            : "hover:bg-[#1E2329]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ExerciseImage
                            src={ex.imageUrl}
                            alt={ex.name}
                            size="sm"
                            fit="contain"
                            className="h-10 w-10 rounded-lg shrink-0 border-[#2A313A]"
                          />
                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-semibold truncate ${
                                isSelected ? "text-[#5BE584]" : "text-white"
                              }`}
                            >
                              {ex.name}
                            </h4>
                            <p className="text-[10px] text-[#9CA3AF] capitalize truncate">
                              {ex.primaryMuscles?.join(", ") || "Full Body"} •{" "}
                              {Array.isArray(ex.equipment)
                                ? ex.equipment.join(", ")
                                : ex.equipment || "Bodyweight"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-[#5BE584] border-[#5BE584] text-[#090B0F]"
                                : "border-[#2A313A] bg-[#090B0F]"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 2: Reason for Swapping */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                2. Reason for Replacement
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_REASONS.map((reason) => {
                  const isChecked = selectedReason === reason;
                  return (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                        isChecked
                          ? "border-[#5BE584]/60 bg-[#16291D]/50 text-white font-medium"
                          : "border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="swapReason"
                        checked={isChecked}
                        onChange={() => setSelectedReason(reason)}
                        className="accent-[#5BE584] text-[#5BE584] focus:ring-0"
                      />
                      <span>{reason}</span>
                    </label>
                  );
                })}
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">
                  Additional Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g., Cable machine was out of order, substituted with dumbbells..."
                  className="w-full rounded-xl border border-[#1E2329] bg-[#101418] p-3 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584] resize-none"
                />
              </div>
            </div>

            {/* Selected Summary Preview */}
            {selectedExercise && (
              <div className="rounded-xl border border-[#23422E] bg-[#16291D]/30 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] shrink-0">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#5BE584]">
                      Selected Movement
                    </p>
                    <p className="text-xs font-bold text-white truncate">
                      {selectedExercise.name}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-[#9CA3AF] shrink-0 font-mono">
                  {exerciseLog.targetSets} sets × {exerciseLog.targetReps} reps
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-5 sm:p-6 border-t border-[#1E2329] bg-[#090B0F]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSwapping}
              className="px-4 py-2 rounded-xl border border-[#1E2329] bg-[#101418] text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSwap}
              disabled={!selectedExerciseId || isSwapping}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(91,229,132,0.15)]"
            >
              {isSwapping ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Swapping Movement...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>Confirm Swap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SwapExerciseDialog;
