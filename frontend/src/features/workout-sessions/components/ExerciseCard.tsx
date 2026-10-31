import React, { useState, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  ExternalLink,
  History,
  Info,
  Layers,
  Loader2,
  PlayCircle,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type {
  WorkoutExerciseLog,
  WorkoutSetLog,
  PreviousExercisePerformance,
} from "../types/workout-session.types";
import { SetRow } from "./SetRow";
import { useCreateWorkoutSet } from "../hooks/useCreateWorkoutSet";
import { useDeleteWorkoutSet } from "../hooks/useDeleteWorkoutSet";
import { useCurrentWorkoutSession } from "../hooks/useCurrentWorkoutSession";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";
import SwapExerciseDialog from "./SwapExerciseDialog";

export interface ExerciseCardProps {
  exercise: WorkoutExerciseLog;
  sessionId?: string;
  previousPerformance?: PreviousExercisePerformance | null;
  onSetCompleted?: (restSeconds?: number) => void;
  isFocused?: boolean;
  showConnector?: boolean;
  children?: ReactNode;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  sessionId,
  previousPerformance,
  onSetCompleted,
  isFocused = false,
  showConnector = false,
  children,
}) => {
  const { t } = useTranslation(["workoutSessions", "common"]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [setPendingDelete, setSetPendingDelete] = useState<{
    set: WorkoutSetLog;
    hasChildren: boolean;
    childrenCount: number;
  } | null>(null);
  const { data: currentSessionData } = useCurrentWorkoutSession();
  const effectiveSessionId = sessionId || currentSessionData?.session?.id || "";
  const { mutate: createSet, isPending: isCreatingSet } = useCreateWorkoutSet();
  const { mutate: deleteSet, isPending: isDeletingSet } = useDeleteWorkoutSet();

  const sets = exercise.sets || [];

  // Group sets by parent setNumber:
  const setsByNumber = useMemo(() => {
    const map = new Map<number, WorkoutSetLog[]>();
    for (const s of sets) {
      if (!map.has(s.setNumber)) {
        map.set(s.setNumber, []);
      }
      map.get(s.setNumber)!.push(s);
    }
    // Sort stages inside each set by segmentIndex
    for (const stageList of map.values()) {
      stageList.sort((a, b) => (a.segmentIndex ?? 0) - (b.segmentIndex ?? 0));
    }
    return map;
  }, [sets]);

  const uniqueSetNumbers = useMemo(
    () => Array.from(setsByNumber.keys()).sort((a, b) => a - b),
    [setsByNumber],
  );

  const totalParentSets = Math.max(
    uniqueSetNumbers.length,
    exercise.targetSets || 0,
  );

  // A parent set is complete ONLY when all its stages are completed
  const completedParentSetsCount = useMemo(() => {
    let count = 0;
    for (const stageList of setsByNumber.values()) {
      if (stageList.length > 0 && stageList.every((s) => s.completed)) {
        count++;
      }
    }
    return count;
  }, [setsByNumber]);

  const isExerciseDone =
    exercise.completed ||
    (uniqueSetNumbers.length > 0 && completedParentSetsCount >= totalParentSets);

  const exerciseDetails = exercise.exercise;
  const exerciseImage = exerciseDetails?.imageUrl || null;
  const primaryMuscles = exerciseDetails?.primaryMuscles || [];
  const secondaryMuscles = exerciseDetails?.secondaryMuscles || [];
  const equipment = exerciseDetails?.equipment || [];
  const instructions = exerciseDetails?.instructions || [];
  const tips = exerciseDetails?.tips || [];
  const videoUrl = exerciseDetails?.videoUrl;

  const highestPerformance = previousPerformance?.highestPerformance;

  const bestSet =
    exercise.previousBestSet ||
    previousPerformance?.bestSet ||
    (previousPerformance?.sets && previousPerformance.sets.length > 0
      ? [...previousPerformance.sets].sort((a, b) =>
          b.weight !== a.weight
            ? b.weight - a.weight
            : b.actualReps - a.actualReps,
        )[0]
      : null);

  const handleAddExtraSet = () => {
    const nextSetNumber =
      (uniqueSetNumbers[uniqueSetNumbers.length - 1] || 0) + 1;
    const lastSet = sets[sets.length - 1];
    createSet({
      exerciseLog: exercise.id,
      setNumber: nextSetNumber,
      segmentIndex: 0,
      setType: "NORMAL",
      isIntermediateSegment: false,
      isFinalSegment: true,
      targetReps: exercise.targetReps || "10",
      actualReps: lastSet?.actualReps || 10,
      weight: lastSet?.weight || 0,
      completed: false,
    });
  };

  const handleAddBreakSet = (
    setNumber: number,
    stageList: WorkoutSetLog[],
  ) => {
    const lastStage = stageList[stageList.length - 1];
    const nextSegmentIndex = stageList.length;
    const lastWeight = lastStage?.weight || exercise.targetWeight || 40;
    const nextWeight = Math.max(
      0,
      lastWeight > 10 ? lastWeight - 10 : Math.max(0, lastWeight - 5),
    );
    const targetReps = lastStage?.targetReps || exercise.targetReps || "8";

    createSet({
      exerciseLog: exercise.id,
      setNumber,
      segmentIndex: nextSegmentIndex,
      setType: "DROP_SET",
      isIntermediateSegment: false,
      isFinalSegment: true,
      targetReps,
      weight: nextWeight,
      actualReps: 0,
      completed: false,
    });
  };

  const handlePromptDelete = (
    set: WorkoutSetLog,
    hasChildren: boolean,
    childrenCount: number,
  ) => {
    setSetPendingDelete({ set, hasChildren, childrenCount });
  };

  const handleConfirmDelete = () => {
    if (!setPendingDelete) return;
    deleteSet(setPendingDelete.set.id, {
      onSuccess: () => {
        setSetPendingDelete(null);
      },
    });
  };

  return (
    <div className="relative">
      <section
        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
          isExerciseDone
            ? "border-[#23422E] bg-[#101418]/90 shadow-md"
            : isFocused
              ? "border-[#5BE584]/50 bg-[#101418] ring-1 ring-[#5BE584]/30 shadow-xl"
              : "border-[#1E2329] bg-[#101418] hover:border-[#2A313A]"
        }`}
      >
        {/* =====================================================================
            TOP EXERCISE HERO: Clean Left & Right Alignment
            Left: Title, Targets, Badges, Previous Benchmark, Form guide, Swap
            Right: White Framed High-Res Athletic Exercise Illustration
           ===================================================================== */}
        <div className="p-4 sm:p-6 border-b border-[#1E2329] bg-[#0E1216]">
          <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-5">
            {/* LEFT: Exercise Info & Telemetry */}
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    {exercise.order ? `#${exercise.order}` : "#"}
                  </span>
                  {isExerciseDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] bg-[#16291D] border border-[#23422E] px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                      {t("exerciseCard.movementDone", "Movement Completed")}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                  {exercise.exerciseName}
                </h3>

                {/* Target Sets & Reps Pill */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141920] border border-[#262D36] text-xs font-mono font-bold text-white">
                    <Layers className="h-3.5 w-3.5 text-[#5BE584]" />
                    {totalParentSets} Sets × {exercise.targetReps || "10"}
                  </span>

                  {exercise.targetWeight != null && exercise.targetWeight > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#16291D] border border-[#23422E] text-[11px] font-mono text-[#5BE584] font-semibold">
                      {t("exerciseCard.targetLoad", {
                        weight: exercise.targetWeight,
                        defaultValue: `Target Load: ${exercise.targetWeight} kg`,
                      })}
                    </span>
                  )}

                  {exercise.targetRpe != null && exercise.targetRpe > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#1E2329] text-[11px] font-mono text-[#E5E7EB] font-semibold">
                      {t("exerciseCard.targetRpe", {
                        rpe: exercise.targetRpe,
                        defaultValue: `Target RPE ${exercise.targetRpe}`,
                      })}
                    </span>
                  )}
                </div>

                {/* Replacement Indicator Banner */}
                {exercise.originalExerciseId && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg bg-[#141920] border border-[#262D36] px-3 py-1.5 text-xs text-[#9CA3AF]">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
                    <span>
                      {t("exerciseCard.replacedFrom", {
                        name:
                          exercise.originalExercise?.name || "Original Movement",
                        defaultValue: `Replaced from: ${
                          exercise.originalExercise?.name || "Original Movement"
                        }`,
                      })}
                    </span>
                    {exercise.swapReason && (
                      <>
                        <span className="text-[#6B7280]">?</span>
                        <span className="text-[#5BE584]/90 font-medium">
                          {exercise.swapReason}
                        </span>
                      </>
                    )}
                  </div>
                )}
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
                {highestPerformance ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-[11px] text-[#9CA3AF]">
                    <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>{t("exerciseCard.highestBest", "All-Time Best:")}</span>
                    <span className="font-mono font-bold text-white">
                      {highestPerformance.weight > 0
                        ? t("exerciseCard.highestBestValue", {
                            weight: highestPerformance.weight,
                            reps: highestPerformance.actualReps,
                            defaultValue: `${highestPerformance.weight} kg × ${highestPerformance.actualReps} reps`,
                          })
                        : t("setRow.highestRepsOnly", {
                            reps: highestPerformance.actualReps,
                            defaultValue: `${highestPerformance.actualReps} reps`,
                          })}
                    </span>
                  </div>
                ) : bestSet && (bestSet.weight > 0 || bestSet.actualReps > 0) ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#5BE584]/25 bg-[#16291D]/60 px-3 py-1.5 text-[11px] text-[#9CA3AF]">
                    <History className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
                    <span>{t("exerciseCard.bestPreviousSet", "Best previous set:")}</span>
                    <span className="font-mono font-bold text-white">
                      {t("exerciseCard.bestPreviousValue", {
                        weight: bestSet.weight,
                        reps: bestSet.actualReps,
                        defaultValue: `${bestSet.weight} kg × ${bestSet.actualReps} reps`,
                      })}
                    </span>
                  </div>
                ) : previousPerformance ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] text-[#9CA3AF]">
                    <History className="h-3.5 w-3.5 text-[#5BE584] shrink-0" />
                    <span>{t("exerciseCard.lastSession", "Last Session:")}</span>
                    <span className="font-mono font-semibold text-white">
                      {t("exerciseCard.lastSessionValue", {
                        weight: previousPerformance.maxWeight ?? 0,
                        volume: previousPerformance.totalVolume ?? 0,
                        defaultValue: `${previousPerformance.maxWeight ?? 0} kg max • ${previousPerformance.totalVolume ?? 0} kg vol`,
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-2.5 py-1 text-[11px] text-[#6B7280]">
                    <span>{t("exerciseCard.noPrevious", "No previous performance yet")}</span>
                  </div>
                )}

                {(instructions.length > 0 || tips.length > 0) && (
                  <button
                    type="button"
                    onClick={() => setShowInstructions((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/40 hover:text-white transition-colors"
                  >
                    <Info className="h-3.5 w-3.5 text-[#5BE584]" />
                    <span>
                      {showInstructions
                        ? t("exerciseCard.hideCues", "Hide Cues")
                        : t("exerciseCard.formGuide", "Form Guide")}
                    </span>
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
                    <span>{t("exerciseCard.videoDemo", "Video Demo")}</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                )}

                {/* In-Session Exercise Swap Action */}
                {!isExerciseDone && effectiveSessionId && (
                  <button
                    type="button"
                    onClick={() => setIsSwapDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/40 hover:text-white transition-colors"
                    title={t("exerciseCard.swapExercise", "Swap Exercise")}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 text-[#5BE584]" />
                    <span>{t("exerciseCard.swapExercise", "Swap Exercise")}</span>
                  </button>
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
                    {t("exerciseCard.stepByStep", "Step-by-Step Execution")}
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
                    {t("exerciseCard.coachingTips", "Pro Coaching Tips")}
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
        <div className="p-3 sm:p-6 space-y-2.5 sm:space-y-3">
          {children ? (
            <div>
              <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 pb-3 border-b border-white/5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                <div className="col-span-2">{t("exerciseCard.tableSet", "Set")}</div>
                <div className="col-span-2">{t("exerciseCard.tableTarget", "Target")}</div>
                <div className="col-span-3 text-center">{t("setRow.kgUnit", "kg")}</div>
                <div className="col-span-5">{t("setRow.reps", "Reps")}</div>
              </div>
              <div className="mt-3 space-y-2">{children}</div>
            </div>
          ) : (
            <>
              <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 pb-2 border-b border-[#1E2329] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                <div className="col-span-2 sm:col-span-2">{t("exerciseCard.tableSetAndStage", "Set & Stage")}</div>
                <div className="col-span-2 sm:col-span-2">{t("exerciseCard.tableTarget", "Target")}</div>
                <div className="col-span-2 sm:col-span-3">{t("exerciseCard.tablePerformance", "Prev / Highest")}</div>
                <div className="col-span-3 sm:col-span-2 text-center">{t("exerciseCard.tableWeight", "Weight (kg)")}</div>
                <div className="col-span-3 sm:col-span-3 text-end ltr:pr-11 rtl:pl-11">{t("exerciseCard.tableActualReps", "Actual Reps")}</div>
              </div>

              <div className="space-y-3">
                {uniqueSetNumbers.map((setNum) => {
                  const stageList = setsByNumber.get(setNum) || [];
                  if (stageList.length === 0) return null;

                  const parentSet = stageList[0];
                  const childStages = stageList.slice(1);
                  const hasBreakSets = childStages.length > 0;

                  const prevSetParent = previousPerformance?.sets?.find(
                    (ps) =>
                      ps.setNumber === setNum &&
                      (ps.segmentIndex ?? 0) === 0,
                  );

                  return (
                    <div key={`set-group-${setNum}`} className="space-y-1.5">
                      {/* Parent Set Row (1.0, 2.0, etc.) */}
                      <SetRow
                        set={parentSet}
                        previousSet={prevSetParent}
                        highestPerformance={highestPerformance}
                        targetRestSeconds={exercise.restSeconds || 60}
                        stageLabel={
                          hasBreakSets
                            ? t("setRow.parentLabel", "Prescribed Parent Set")
                            : parentSet.setType === "WARMUP"
                              ? t("setRow.warmupLabel", "Warmup Set")
                              : undefined
                        }
                        stageBadge={
                          hasBreakSets
                            ? t("setRow.parentBadge", "PARENT")
                            : parentSet.setType !== "NORMAL"
                              ? parentSet.setType
                              : undefined
                        }
                        onSetCompleted={onSetCompleted}
                        onDelete={() =>
                          handlePromptDelete(
                            parentSet,
                            hasBreakSets,
                            childStages.length,
                          )
                        }
                        isDeleting={
                          isDeletingSet &&
                          setPendingDelete?.set.id === parentSet.id
                        }
                        hasChildren={hasBreakSets}
                      />

                      {/* If Break Sets exist, render indented children directly underneath */}
                      {hasBreakSets ? (
                        <div className="ltr:ml-1.5 sm:ltr:ml-6 ltr:pl-2 sm:ltr:pl-4 rtl:mr-1.5 sm:rtl:mr-6 rtl:pr-2 sm:rtl:pr-4 ltr:border-l-2 rtl:border-r-2 border-amber-500/35 space-y-2 py-1 bg-amber-500/[0.02] ltr:rounded-r-xl rtl:rounded-l-xl">
                          {childStages.map((child, cIdx) => {
                            const breakIndex =
                              child.segmentIndex ?? (cIdx + 1);
                            const prevSetChild =
                              previousPerformance?.sets?.find(
                                (ps) =>
                                  ps.setNumber === setNum &&
                                  (ps.segmentIndex ?? 0) === breakIndex,
                              );

                            return (
                              <SetRow
                                key={child.id}
                                set={child}
                                previousSet={prevSetChild}
                                highestPerformance={highestPerformance}
                                targetRestSeconds={
                                  exercise.restSeconds || 60
                                }
                                stageLabel={t("setRow.breakLabel", {
                                  index: breakIndex,
                                  parent: setNum,
                                  defaultValue: `Break Set ${breakIndex} under Set ${setNum}.0 (No rest)`,
                                })}
                                stageBadge={t("setRow.breakBadge", {
                                  index: breakIndex,
                                  defaultValue: `BREAK ${breakIndex}`,
                                })}
                                onSetCompleted={onSetCompleted}
                                onDelete={() =>
                                  handlePromptDelete(child, false, 0)
                                }
                                isDeleting={
                                  isDeletingSet &&
                                  setPendingDelete?.set.id === child.id
                                }
                                isChild={true}
                              />
                            );
                          })}

                          {/* Action to add another Break Set under this parent */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                handleAddBreakSet(setNum, stageList)
                              }
                              disabled={isCreatingSet}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {isCreatingSet ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                              <span>{t("exerciseCard.addBreakSet", "Add Break Set")}</span>
                            </button>

                            <span className="text-[10px] text-amber-400/80 font-mono">
                              {t("exerciseCard.breakSetNotice", "Rest timer triggers after final break set")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Action to add the first Break Set under this parent */
                        <div className="flex justify-end ltr:pr-2 rtl:pl-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleAddBreakSet(setNum, [parentSet])
                            }
                            disabled={isCreatingSet}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#9CA3AF] hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title={t("exerciseCard.addBreakSet", "Add Break Set")}
                          >
                            <Plus className="h-3 w-3" />
                            <span>{t("exerciseCard.addBreakSet", "Add Break Set")}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Extra Set Actions */}
              <div className="pt-3 flex flex-wrap justify-between items-center gap-2 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddExtraSet}
                    disabled={isCreatingSet}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#2A313A] bg-[#090B0F]/60 px-3.5 py-2 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/50 hover:text-[#5BE584] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingSet ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>{t("exerciseCard.addSet", "Add Set")}</span>
                  </button>
                </div>

                {isExerciseDone && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5BE584]">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("exerciseCard.allSetsLogged", "All Prescribed Sets Logged")}
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

      {/* Set Removal Confirmation Dialog Modal */}
      <Dialog
        open={Boolean(setPendingDelete)}
        onOpenChange={(open) => !open && setSetPendingDelete(null)}
      >
        <DialogContent className="border-[#1E2329] bg-[#0D1014] text-[#F3F4F6] sm:max-w-md p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <DialogTitle className="text-base font-bold text-white">
                {setPendingDelete?.hasChildren
                  ? setPendingDelete.childrenCount > 1
                    ? t("exerciseCard.deleteDialogTitleWithChildrenPlural", {
                        setNum: setPendingDelete.set.setNumber,
                        count: setPendingDelete.childrenCount,
                        defaultValue: `Remove Set ${setPendingDelete.set.setNumber}.0 and ${setPendingDelete.childrenCount} Break Sets?`,
                      })
                    : t("exerciseCard.deleteDialogTitleWithChildren", {
                        setNum: setPendingDelete.set.setNumber,
                        count: setPendingDelete.childrenCount,
                        defaultValue: `Remove Set ${setPendingDelete.set.setNumber}.0 and 1 Break Set?`,
                      })
                  : t("exerciseCard.deleteDialogTitle", {
                      setNum: setPendingDelete?.set.setNumber,
                      segmentIndex: setPendingDelete?.set.segmentIndex ?? 0,
                      defaultValue: `Remove Set ${setPendingDelete?.set.setNumber}.${setPendingDelete?.set.segmentIndex ?? 0}?`,
                    })}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#9CA3AF] leading-relaxed">
              {setPendingDelete?.hasChildren ? (
                setPendingDelete.childrenCount > 1 ? (
                  t("exerciseCard.deleteDescWithChildrenPlural", {
                    count: setPendingDelete.childrenCount,
                    setNum: setPendingDelete.set.setNumber,
                    defaultValue: `This parent set contains ${setPendingDelete.childrenCount} break sets. Removing Set ${setPendingDelete.set.setNumber}.0 will also remove all of its child break sets. This action cannot be undone.`,
                  })
                ) : (
                  t("exerciseCard.deleteDescWithChildren", {
                    count: setPendingDelete.childrenCount,
                    setNum: setPendingDelete.set.setNumber,
                    defaultValue: `This parent set contains 1 break set. Removing Set ${setPendingDelete.set.setNumber}.0 will also remove all of its child break sets. This action cannot be undone.`,
                  })
                )
              ) : setPendingDelete?.set.completed ? (
                t("exerciseCard.deleteDescCompleted", {
                  weight: setPendingDelete.set.weight,
                  reps: setPendingDelete.set.actualReps,
                  defaultValue: `This set has already been completed and logged. Removing it will remove its weight (${setPendingDelete.set.weight} kg × ${setPendingDelete.set.actualReps} reps) from your session volume.`,
                })
              ) : (
                t("exerciseCard.deleteDescDefault", {
                  setNum: setPendingDelete?.set.setNumber,
                  segmentIndex: setPendingDelete?.set.segmentIndex ?? 0,
                  defaultValue: `Are you sure you want to remove Set ${setPendingDelete?.set.setNumber}.${setPendingDelete?.set.segmentIndex ?? 0} from this active workout session?`,
                })
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSetPendingDelete(null)}
              className="border-[#262D36] bg-[#141920] hover:bg-[#1E2329] text-white text-xs cursor-pointer"
            >
              {t("exerciseCard.cancel", "Cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeletingSet}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer"
            >
              {isDeletingSet ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin ltr:mr-1.5 rtl:ml-1.5" />
                  {t("exerciseCard.removing", "Removing...")}
                </>
              ) : (
                t("exerciseCard.confirmRemoval", "Confirm Removal")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Exercise Dialog Modal */}
      {effectiveSessionId && (
        <SwapExerciseDialog
          isOpen={isSwapDialogOpen}
          onClose={() => setIsSwapDialogOpen(false)}
          sessionId={effectiveSessionId}
          exerciseLog={exercise}
        />
      )}
    </div>
  );
};

export default ExerciseCard;
