// src/features/workouts/components/AddWorkoutDialog.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Link as LinkIcon,
  Search,
  Dumbbell,
  Clock,
  Layers,
  Play,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import {
  resolveWorkout,
  type ResolvedWorkoutResult,
} from "../api/workouts.api";
import { useDuplicateWorkout } from "../hooks/useDuplicateWorkout";
import { useStartWorkoutSession } from "@/features/workout-sessions/hooks/useStartWorkoutSession";
import { useCurrentWorkoutSession } from "@/features/workout-sessions/hooks/useCurrentWorkoutSession";
import ActiveWorkoutConflictDialog from "@/features/workout-sessions/components/ActiveWorkoutConflictDialog";

interface AddWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutAdded?: () => void;
}

export default function AddWorkoutDialog({
  isOpen,
  onClose,
  onWorkoutAdded,
}: AddWorkoutDialogProps) {
  const { t } = useTranslation(["workouts", "common"]);
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedResult, setResolvedResult] =
    useState<ResolvedWorkoutResult | null>(null);

  const { mutate: duplicate, isPending: isDuplicating } = useDuplicateWorkout();
  const { mutate: startSession, isPending: isStarting } =
    useStartWorkoutSession();
  const { data: currentSessionData } = useCurrentWorkoutSession();

  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    activeSessionId: string;
    activeWorkoutTitle: string;
    requestedWorkoutId?: string;
    requestedWorkoutTitle?: string;
  }>({
    isOpen: false,
    activeSessionId: "",
    activeWorkoutTitle: "",
  });

  if (!isOpen) return null;

  const handleResolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError(t("dialogs.emptyInputError", "Please enter a workout ID, share code, or STREN workout link."));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResolvedResult(null);

    try {
      const result = await resolveWorkout(trimmed);
      setResolvedResult(result);
      toast.success(t("dialogs.resolveSuccess", "Workout verified and resolved successfully!"));
      if (onWorkoutAdded) onWorkoutAdded();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("dialogs.resolveFailedError", "Could not resolve workout. Please check the ID or link and try again.");
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = (workoutId: string, workoutTitle: string) => {
    const active = currentSessionData?.session;
    if (active && active.status === "IN_PROGRESS") {
      const activeWorkoutId =
        active.workout?.id || (active as any).workoutId;
      if (activeWorkoutId === workoutId) {
        toast.success("Resuming your active workout session.");
        onClose();
        navigate("/sessions/active");
        return;
      }

      setConflictModal({
        isOpen: true,
        activeSessionId: active.id,
        activeWorkoutTitle: active.workout?.title || "Active Workout",
        requestedWorkoutId: workoutId,
        requestedWorkoutTitle: workoutTitle,
      });
      return;
    }

    startSession(
      { workout: workoutId },
      {
        onSuccess: () => {
          onClose();
          navigate("/sessions/active");
        },
        onError: (err: any) => {
          const conflictData = err?.response?.data?.data;
          if (err?.response?.status === 409 && conflictData?.activeSessionId) {
            setConflictModal({
              isOpen: true,
              activeSessionId: conflictData.activeSessionId,
              activeWorkoutTitle:
                conflictData.activeWorkoutTitle || "Active Workout",
              requestedWorkoutId: workoutId,
              requestedWorkoutTitle: workoutTitle,
            });
          } else {
            toast.error(
              err?.response?.data?.message || "Failed to start workout session.",
            );
          }
        },
      },
    );
  };

  const handleSaveCopy = (workoutId: string) => {
    duplicate(
      { id: workoutId },
      {
        onSuccess: () => {
          toast.success(t("dialogs.copySavedToast", "Personal copy saved to your My Workouts list!"));
          onClose();
          navigate("/workout-builder/all");
        },
      },
    );
  };

  const workout = resolvedResult?.workout;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-lg rounded-2xl border border-[#1E2329] bg-[#101418] p-6 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/20">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {t("dialogs.addByIdTitle", "Add Workout by ID or Link")}
                </h3>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                {t("dialogs.addByIdDesc", "Paste a STREN workout UUID, share code, or URL to inspect and access the routine.")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[#9CA3AF] hover:bg-[#1E2329] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleResolve} className="space-y-3">
            <label className="block text-xs font-semibold text-[#D1D5DB]">
              {t("dialogs.idOrLinkInputLabel", "Workout ID or Share Link")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t("dialogs.idOrLinkPlaceholder", "e.g. 550e8400... or https://.../workouts/...")}
                  className="w-full h-10 ps-10 pe-4 rounded-xl border border-[#1E2329] bg-[#090B0F] text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="h-10 px-4 rounded-xl bg-[#5BE584] text-xs font-bold text-[#090B0F] hover:bg-[#4ade80] disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t("dialogs.resolving", "Resolving...")}</span>
                  </>
                ) : (
                  <span>{t("dialogs.verifyAndAdd", "Verify & Add")}</span>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Resolved Workout Card */}
          {workout && (
            <div className="rounded-xl border border-[#23422E] bg-[#16291D]/40 p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#5BE584]/15 text-[#5BE584] border border-[#5BE584]/30">
                      {resolvedResult?.sourceType === "template"
                        ? t("badges.publicTemplate", "Public Template")
                        : resolvedResult?.sourceType === "assigned"
                          ? t("badges.coachAssigned", "Coach Assigned")
                          : resolvedResult?.sourceType === "personal"
                            ? t("badges.personalRoutine", "Personal Routine")
                            : t("badges.sharedWorkout", "Shared Workout")}
                    </span>
                    {resolvedResult?.isAlreadySaved && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("badges.inYourLibrary", "In Your Library")}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {workout.title}
                  </h4>
                  {workout.description && (
                    <p className="text-xs text-[#9CA3AF] line-clamp-2">
                      {workout.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#2A3039]/60 text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="h-3.5 w-3.5 text-[#5BE584]" />
                  <span>{t(`categories.${workout.category.toLowerCase()}`, workout.category)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#5BE584]" />
                  <span>{t("card.estDuration", { count: workout.estimatedDuration, defaultValue: `~${workout.estimatedDuration}m` })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#5BE584]" />
                  <span>{t("dialogs.movementsCount", { count: workout.exercises?.length || 0, defaultValue: `${workout.exercises?.length || 0} Movements` })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStartWorkout(workout.id, workout.title)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-bold text-[#090B0F] hover:bg-[#4ade80] transition-all shadow-md shadow-[#5BE584]/10 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isStarting ? t("actions.starting", "Starting...") : t("actions.startWorkout", "Start Workout")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/workout-builder/${workout.id}`);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#101418] px-3.5 py-2.5 text-xs font-semibold text-white hover:border-[#2A313A] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  <span>{t("actions.details", "Details")}</span>
                </button>

                {!resolvedResult?.isAlreadySaved && (
                  <button
                    type="button"
                    disabled={isDuplicating}
                    onClick={() => handleSaveCopy(workout.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#101418] px-3.5 py-2.5 text-xs font-semibold text-[#5BE584] hover:bg-[#16291D] hover:border-[#23422E] transition-colors disabled:opacity-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{isDuplicating ? t("actions.saving", "Saving...") : t("actions.saveCopy", "Save Copy")}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E2329] text-[11px] text-[#6B7280]">
            <span>{t("dialogs.supportedFormats", "Supported: UUIDs, share codes, and STREN workout links")}</span>
            <button
              type="button"
              onClick={onClose}
              className="hover:text-white transition-colors"
            >
              {t("actions.cancel", "Cancel")}
            </button>
          </div>
        </div>
      </div>

      {/* Active Session Conflict Dialog */}
      <ActiveWorkoutConflictDialog
        isOpen={conflictModal.isOpen}
        onClose={() =>
          setConflictModal((prev) => ({ ...prev, isOpen: false }))
        }
        activeSessionId={conflictModal.activeSessionId}
        activeWorkoutTitle={conflictModal.activeWorkoutTitle}
        requestedWorkoutId={conflictModal.requestedWorkoutId}
        requestedWorkoutTitle={conflictModal.requestedWorkoutTitle}
      />
    </>
  );
}
