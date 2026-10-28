import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Plus,
  Dumbbell,
  Loader2,
  Check,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

import { useAllExercises } from "@/features/exercises/hooks/useExercises";
import type { Exercise } from "@/features/exercises/types/exercise.types";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";
import {
  ALL_MUSCLE_CATEGORIES,
  doesExerciseMatchMuscle,
} from "@/features/exercises/constants/exercise.constants";
import { useAddExerciseToSession } from "../hooks/useAddExerciseToSession";

export interface AddSessionExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const AddSessionExerciseDialog: React.FC<AddSessionExerciseDialogProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Configuration fields
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  const [targetWeight, setTargetWeight] = useState(0);
  const [restSeconds, setRestSeconds] = useState(60);
  const [notes, setNotes] = useState("");

  const { data: exercisesResponse, isLoading: isLoadingExercises } = useAllExercises();
  const { mutate: addExercise, isPending: isAdding } = useAddExerciseToSession();

  const allExercises: Exercise[] = useMemo(() => {
    if (!exercisesResponse) return [];
    if (Array.isArray(exercisesResponse)) return exercisesResponse;
    const res = exercisesResponse as any;
    return res.exercises || res.data?.exercises || [];
  }, [exercisesResponse]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch =
        !searchQuery.trim() ||
        ex.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        ex.equipment?.some((eq) =>
          eq.toLowerCase().includes(searchQuery.toLowerCase().trim()),
        );

      const matchesMuscle = doesExerciseMatchMuscle(ex, selectedMuscle);
      return matchesSearch && matchesMuscle;
    });
  }, [allExercises, searchQuery, selectedMuscle]);

  const selectedExercise = useMemo(
    () => allExercises.find((ex) => ex.id === selectedExerciseId),
    [allExercises, selectedExerciseId],
  );

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmAdd = () => {
    if (!selectedExerciseId) return;

    addExercise(
      {
        sessionId,
        payload: {
          exerciseId: selectedExerciseId,
          targetSets: Number(targetSets) || 3,
          targetReps: Number(targetReps) || 10,
          targetWeight: Number(targetWeight) || 0,
          restTimeSeconds: Number(restSeconds) || 60,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          // Reset form state
          setSelectedExerciseId(null);
          setSearchQuery("");
          setSelectedMuscle(null);
          setNotes("");
        },
      },
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-exercise-title"
    >
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-[#1E2329] bg-[#0E1216] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2329] px-5 py-4 bg-[#11161C]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5BE584]/10 border border-[#5BE584]/25 text-[#5BE584]">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2
                id="add-exercise-title"
                className="text-sm sm:text-base font-bold text-white tracking-tight"
              >
                Add Exercise to Workout
              </h2>
              <p className="text-[11px] text-[#9CA3AF]">
                Select a movement and configure target sets for this session
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#9CA3AF] hover:bg-[#1E2329] hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Step 1: Search & Filter */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              1. Choose Movement
            </label>

            {/* Search Bar */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search by exercise name or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#1E2329] bg-[#101418] pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
            </div>

            {/* Muscle Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-24 overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedMuscle(null)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  !selectedMuscle
                    ? "bg-[#5BE584] text-[#090B0F] font-bold shadow-sm"
                    : "bg-[#101418] border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A]"
                }`}
              >
                All
              </button>
              {ALL_MUSCLE_CATEGORIES.map((muscle) => {
                const isActive =
                  selectedMuscle?.toLowerCase() === muscle.toLowerCase();
                return (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() =>
                      setSelectedMuscle(isActive ? null : muscle)
                    }
                    className={`capitalize px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-[#5BE584] text-[#090B0F] font-bold shadow-sm"
                        : "bg-[#101418] border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A]"
                    }`}
                  >
                    {muscle}
                  </button>
                );
              })}
            </div>

            {/* Exercise List */}
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#1E2329] bg-[#101418]/60 divide-y divide-[#1E2329] custom-scrollbar">
              {isLoadingExercises ? (
                <div className="p-8 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#5BE584]" />
                  <span>Loading exercises...</span>
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6B7280]">
                  No exercises match your search or filter.
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isSelected = selectedExerciseId === ex.id;
                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExerciseId(ex.id)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#16291D] border-l-2 border-[#5BE584]"
                          : "hover:bg-[#1E2329]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ExerciseImage
                          src={ex.imageUrl}
                          alt={ex.name}
                          size="sm"
                          fit="contain"
                          className="h-9 w-9 rounded-lg shrink-0 border-[#2A313A]"
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
                            {ex.primaryMuscles?.join(", ") || "General"} •{" "}
                            {ex.equipment?.join(", ") || "Bodyweight"}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5BE584] text-[#090B0F]">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">
                          Select
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Target Prescription Parameters */}
          {selectedExercise && (
            <div className="rounded-xl border border-[#23422E] bg-[#121B15] p-3.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5BE584]">
                  2. Configure Sets & Targets
                </span>
                <span className="text-[11px] text-[#9CA3AF] font-medium">
                  Selected: <strong className="text-white">{selectedExercise.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Target Sets */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={targetSets}
                    onChange={(e) => setTargetSets(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 rounded-lg border border-[#23422E] bg-[#0E1511] px-2.5 text-xs text-white text-center font-bold focus:border-[#5BE584] focus:outline-none"
                  />
                </div>

                {/* Target Reps */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase mb-1">
                    Reps / Set
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetReps}
                    onChange={(e) => setTargetReps(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 rounded-lg border border-[#23422E] bg-[#0E1511] px-2.5 text-xs text-white text-center font-bold focus:border-[#5BE584] focus:outline-none"
                  />
                </div>

                {/* Initial Weight */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="500"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 rounded-lg border border-[#23422E] bg-[#0E1511] px-2.5 text-xs text-white text-center font-bold focus:border-[#5BE584] focus:outline-none"
                  />
                </div>

                {/* Rest Seconds */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase mb-1">
                    Rest (sec)
                  </label>
                  <input
                    type="number"
                    step="15"
                    min="0"
                    max="600"
                    value={restSeconds}
                    onChange={(e) => setRestSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full h-9 rounded-lg border border-[#23422E] bg-[#0E1511] px-2.5 text-xs text-white text-center font-bold focus:border-[#5BE584] focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase mb-1">
                  Session Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Added for extra triceps volume, drop set on last set..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-8 rounded-lg border border-[#23422E] bg-[#0E1511] px-2.5 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1E2329] px-5 py-3.5 bg-[#11161C]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmAdd}
            disabled={!selectedExerciseId || isAdding}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-bold text-[#090B0F] shadow-[0_0_18px_rgba(91,229,132,0.2)] hover:bg-[#49D472] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#090B0F]" />
                <span>Adding to Session...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add to Workout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddSessionExerciseDialog;
