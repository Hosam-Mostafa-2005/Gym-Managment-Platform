import React, { useState } from "react";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Target,
  Dumbbell,
  Layers,
  Plus,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";
import { useWatch, useFormContext, type Control } from "react-hook-form";

import type { Exercise } from "@/features/exercises/types/exercise.types";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";
import type {
  CreateWorkoutPayload,
  PrescribedSet,
  PrescribedSetType,
  PrescribedStage,
} from "../types/workout.types";
import { isLargeMuscleGroup } from "../utils/rest-classification";

import {
  FormCombobox,
  FormInput,
  FormNumberInput,
  FormTextarea,
} from "@/components/form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["workouts", "common"]);
  const { setValue } = useFormContext<CreateWorkoutPayload>();

  const selectedExerciseId = useWatch({
    control,
    name: `exercises.${index}.exercise`,
  });

  const isRestOverridden = useWatch({
    control,
    name: `exercises.${index}.isRestOverridden`,
  });

  const targetSets = useWatch({
    control,
    name: `exercises.${index}.sets`,
  });

  const targetReps = useWatch({
    control,
    name: `exercises.${index}.reps`,
  });

  const targetWeight = useWatch({
    control,
    name: `exercises.${index}.targetWeight`,
  });

  const rawSetsDetail = useWatch({
    control,
    name: `exercises.${index}.setsDetail`,
  });

  const selectedExercise = exercises.find(
    (ex) => (ex._id || ex.id) === selectedExerciseId,
  );

  const isLargeMuscle = isLargeMuscleGroup(selectedExercise?.primaryMuscles);

  // Check if any advanced set exists (DROP_SET or REST_PAUSE)
  const hasAdvancedTechniques = Array.isArray(rawSetsDetail) && rawSetsDetail.some(
    (s) => s.setType === "DROP_SET" || s.setType === "REST_PAUSE" || s.setType === "WARMUP",
  );

  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState<boolean>(() => hasAdvancedTechniques);

  // Normalize setsDetail to guarantee an entry for each set 1..targetSets
  const getNormalizedSetsDetail = (): PrescribedSet[] => {
    const count = Math.max(1, Number(targetSets) || 1);
    const existingList = Array.isArray(rawSetsDetail) ? [...rawSetsDetail] : [];
    const normalized: PrescribedSet[] = [];

    for (let setNum = 1; setNum <= count; setNum++) {
      const match = existingList.find((s) => s.setNumber === setNum);
      if (match) {
        normalized.push(match);
      } else {
        normalized.push({
          setNumber: setNum,
          setType: "NORMAL",
          targetReps: targetReps || "8-10",
          targetWeight: targetWeight != null ? Number(targetWeight) : undefined,
        });
      }
    }
    return normalized;
  };

  const handleSetTypeChange = (setNumber: number, newType: PrescribedSetType) => {
    const list = getNormalizedSetsDetail();
    const idx = list.findIndex((s) => s.setNumber === setNumber);
    if (idx === -1) return;

    const baseWeight =
      list[idx].targetWeight != null
        ? Number(list[idx].targetWeight)
        : (targetWeight != null ? Number(targetWeight) : 50);
    const baseReps = list[idx].targetReps || targetReps || "8-10";

    if (newType === "DROP_SET") {
      const stage1Weight = baseWeight;
      const stage2Weight = Math.max(0, stage1Weight - 10);
      list[idx] = {
        setNumber,
        setType: "DROP_SET",
        targetWeight: stage1Weight,
        targetReps: baseReps,
        stages: [
          {
            segmentIndex: 0,
            stageLabel: "Stage 1 (Initial Effort)",
            targetWeight: stage1Weight,
            targetReps: baseReps,
          },
          {
            segmentIndex: 1,
            stageLabel: "Stage 2 (Drop 1)",
            targetWeight: stage2Weight,
            targetReps: baseReps,
          },
        ],
      };
    } else if (newType === "REST_PAUSE") {
      list[idx] = {
        setNumber,
        setType: "REST_PAUSE",
        targetWeight: baseWeight,
        targetReps: baseReps,
        stages: [
          {
            segmentIndex: 0,
            stageLabel: "Initial Effort",
            targetWeight: baseWeight,
            targetReps: baseReps,
          },
          {
            segmentIndex: 1,
            stageLabel: "RP Effort 1 (10-15s rest)",
            targetWeight: baseWeight,
            targetReps: "3-4",
          },
        ],
      };
    } else {
      list[idx] = {
        setNumber,
        setType: newType,
        targetWeight: baseWeight,
        targetReps: baseReps,
        stages: undefined,
      };
    }

    setValue(`exercises.${index}.setsDetail`, list, { shouldDirty: true });
  };

  const handleAddDropStage = (setNumber: number) => {
    const list = getNormalizedSetsDetail();
    const idx = list.findIndex((s) => s.setNumber === setNumber);
    if (idx === -1) return;

    const stages = list[idx].stages ? [...list[idx].stages!] : [];
    const lastStage = stages[stages.length - 1];
    const lastWeight = lastStage?.targetWeight ?? 40;
    const nextWeight = Math.max(0, lastWeight - 10);
    const nextIndex = stages.length;

    stages.push({
      segmentIndex: nextIndex,
      stageLabel: `Stage ${nextIndex + 1} (Drop ${nextIndex})`,
      targetWeight: nextWeight,
      targetReps: lastStage?.targetReps ?? "5",
    });

    list[idx] = { ...list[idx], stages };
    setValue(`exercises.${index}.setsDetail`, list, { shouldDirty: true });
  };

  const handleAddRestPauseEffort = (setNumber: number) => {
    const list = getNormalizedSetsDetail();
    const idx = list.findIndex((s) => s.setNumber === setNumber);
    if (idx === -1) return;

    const stages = list[idx].stages ? [...list[idx].stages!] : [];
    const lastStage = stages[stages.length - 1];
    const nextIndex = stages.length;

    stages.push({
      segmentIndex: nextIndex,
      stageLabel: `RP Effort ${nextIndex} (10-15s rest)`,
      targetWeight: lastStage?.targetWeight ?? targetWeight ?? 50,
      targetReps: "2-3",
    });

    list[idx] = { ...list[idx], stages };
    setValue(`exercises.${index}.setsDetail`, list, { shouldDirty: true });
  };

  const handleRemoveStage = (setNumber: number, stageIdx: number) => {
    const list = getNormalizedSetsDetail();
    const idx = list.findIndex((s) => s.setNumber === setNumber);
    if (idx === -1 || !list[idx].stages) return;

    const updatedStages = list[idx].stages!
      .filter((_, i) => i !== stageIdx)
      .map((stage, i) => ({
        ...stage,
        segmentIndex: i,
        stageLabel:
          list[idx].setType === "DROP_SET"
            ? i === 0
              ? "Stage 1 (Initial Effort)"
              : `Stage ${i + 1} (Drop ${i})`
            : i === 0
              ? "Initial Effort"
              : `RP Effort ${i} (10-15s rest)`,
      }));

    list[idx] = { ...list[idx], stages: updatedStages };
    setValue(`exercises.${index}.setsDetail`, list, { shouldDirty: true });
  };

  const handleStageFieldChange = (
    setNumber: number,
    stageIdx: number,
    field: "targetWeight" | "targetReps",
    value: string | number,
  ) => {
    const list = getNormalizedSetsDetail();
    const idx = list.findIndex((s) => s.setNumber === setNumber);
    if (idx === -1 || !list[idx].stages) return;

    const stages = [...list[idx].stages!];
    stages[stageIdx] = {
      ...stages[stageIdx],
      [field]:
        field === "targetWeight"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    };

    list[idx] = { ...list[idx], stages };
    setValue(`exercises.${index}.setsDetail`, list, { shouldDirty: true });
  };

  const handleSetFieldChange = (
    setNumber: number,
    field: "targetWeight" | "targetReps",
    value: string | number,
  ) => {
    const list = getNormalizedSetsDetail();
    const idx = list.findIndex((s) => s.setNumber === setNumber);
    if (idx === -1) return;

    list[idx] = {
      ...list[idx],
      [field]:
        field === "targetWeight"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    };

    setValue(`exercises.${index}.setsDetail`, list, { shouldDirty: true });
  };

  const normalizedSets = getNormalizedSetsDetail();

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
            {selectedExercise ? selectedExercise.name : t("form.exerciseMovement", "Exercise Sequence")}
          </h3>
        </div>

        {/* Action Controls: Move Up, Move Down, Delete */}
        <div className="flex items-center gap-1">
          {move && (
            <div className="flex items-center rounded-lg border border-border/40 bg-background/40 p-0.5 mr-1 rtl:mr-0 rtl:ml-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:opacity-30"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                title={t("actions.moveUp", "Move Up")}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="sr-only">{t("actions.moveUp", "Move Up")}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:opacity-30"
                disabled={index >= total - 1}
                onClick={() => move(index, index + 1)}
                title={t("actions.moveDown", "Move Down")}
              >
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">{t("actions.moveDown", "Move Down")}</span>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => remove(index)}
            title={t("actions.removeExercise", "Remove Exercise")}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("actions.removeExercise", "Remove Exercise")}</span>
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
              label={t("form.exerciseMovement", "Exercise Movement")}
              items={exercises}
              getValue={(exercise) => exercise._id || exercise.id || ""}
              getLabel={(exercise) => exercise.name}
              placeholder={t("form.selectExercisePlaceholder", "Select exercise...")}
              searchPlaceholder={t("form.searchTrainingLibrary", "Search training library...")}
              emptyMessage={t("form.noExercisesFound", "No exercises found.")}
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
            label={t("form.targetSets", "Target Sets")}
            min={1}
          />

          <FormInput
            control={control}
            name={`exercises.${index}.reps`}
            label={t("form.defaultTargetReps", "Default Target Reps")}
            placeholder={t("form.repsPlaceholder", "e.g. 8-10 or Failure")}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {t("form.restInterval", "Rest Interval (sec)")}
              </span>
              {isRestOverridden ? (
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  {t("badges.custom", "Custom")}
                </span>
              ) : (
                <span className="text-[10px] text-[#5BE584] font-semibold bg-[#5BE584]/10 px-1.5 py-0.5 rounded border border-[#5BE584]/20">
                  {t("badges.auto", {
                    type: isLargeMuscle ? t("badges.large", "Large") : t("badges.small", "Small"),
                    defaultValue: `Auto (${isLargeMuscle ? "Large" : "Small"})`,
                  })}
                </span>
              )}
            </div>
            <FormNumberInput
              control={control}
              name={`exercises.${index}.restSeconds`}
              label=""
              min={0}
            />
          </div>
        </div>

        {/* Prescription Targets: Target Weight & Target RPE */}
        <div className="rounded-lg border border-border/40 bg-background/20 p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("form.prescriptionTargets", "Prescription Targets (Optional)")}
            </span>
            <span className="text-[11px] text-muted-foreground/80">
              {t("form.prescriptionTargetsHint", "Default baseline targets for this exercise")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormNumberInput
              control={control}
              name={`exercises.${index}.targetWeight`}
              label={t("form.baselineLoad", "Baseline Load (kg)")}
              placeholder={t("form.baselineLoadPlaceholder", "e.g. 80 or 82.5")}
              min={0}
              step={0.5}
            />

            <FormNumberInput
              control={control}
              name={`exercises.${index}.targetRpe`}
              label={t("form.targetExertion", "Target Exertion (RPE 1–10)")}
              placeholder={t("form.targetExertionPlaceholder", "e.g. 8")}
              min={1}
              max={10}
              step={0.5}
            />
          </div>
        </div>

        {/* ===================================================================== */}
        {/*           INDIVIDUAL SET & STAGE CONFIGURATION (DROP SET / RP)        */}
        {/* ===================================================================== */}
        <div className="rounded-xl border border-border/50 bg-[#090B0F]/60 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setIsAdvancedExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between p-3.5 sm:px-4 text-start hover:bg-background/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#5BE584]" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  {t("form.setTypesAndTechniques", "Set Types & Advanced Techniques")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {t("form.setTypesHint", "Configure Normal, Drop Sets, Rest-Pause, or Warmup sets individually")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasAdvancedTechniques ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/20">
                  <Flame className="h-3 w-3" />
                  {t("badges.advancedConfigured", "Advanced Sets Configured")}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  {t("badges.standardSets", { count: targetSets || 1, defaultValue: `${targetSets || 1} Standard Sets` })}
                </span>
              )}

              {isAdvancedExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {isAdvancedExpanded && (
            <div className="p-3.5 sm:p-4 border-t border-border/30 space-y-3.5 bg-background/20">
              {normalizedSets.map((setCfg) => {
                const isDropSet = setCfg.setType === "DROP_SET";
                const isRestPause = setCfg.setType === "REST_PAUSE";
                const isWarmup = setCfg.setType === "WARMUP";

                return (
                  <div
                    key={setCfg.setNumber}
                    className={`rounded-lg border p-3 transition-all ${
                      isDropSet
                        ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.05)]"
                        : isRestPause
                          ? "border-purple-500/30 bg-purple-500/5 shadow-[0_0_12px_rgba(168,85,247,0.05)]"
                          : isWarmup
                            ? "border-cyan-500/30 bg-cyan-500/5"
                            : "border-border/40 bg-background/30"
                    }`}
                  >
                    {/* Set Header: Number and Set Type Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/30">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-background/70 border border-border/40">
                          {t("form.setNumber", { number: setCfg.setNumber, defaultValue: `Set #${setCfg.setNumber}.0` })}
                        </span>

                        {isDropSet && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {t("form.dropBreakSetsBadge", { count: setCfg.stages?.length || 2, defaultValue: `Drop / Break Sets (${setCfg.stages?.length || 2} Stages)` })}
                          </span>
                        )}

                        {isRestPause && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t("form.restPauseBadge", { count: setCfg.stages?.length || 2, defaultValue: `Rest-Pause (${setCfg.stages?.length || 2} Efforts)` })}
                          </span>
                        )}

                        {isWarmup && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            {t("form.warmupBadge", "Warm-up")}
                          </span>
                        )}
                      </div>

                      {/* Type Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-medium">{t("form.typeLabel", "Type:")}</span>
                        <select
                          value={setCfg.setType}
                          onChange={(e) =>
                            handleSetTypeChange(
                              setCfg.setNumber,
                              e.target.value as PrescribedSetType,
                            )
                          }
                          className="text-xs font-medium rounded-md border border-border/60 bg-[#101418] text-white px-2.5 py-1 focus:outline-none focus:border-[#5BE584]"
                        >
                          <option value="NORMAL">{t("form.standardSetOption", "Standard Set")}</option>
                          <option value="DROP_SET">{t("form.dropSetOption", "Drop Set (Multi-Stage)")}</option>
                          <option value="REST_PAUSE">{t("form.restPauseOption", "Rest-Pause Set")}</option>
                          <option value="WARMUP">{t("form.warmupOption", "Warmup Set")}</option>
                        </select>
                      </div>
                    </div>

                    {/* Set Body: Stages or Standard Set Fields */}
                    <div className="pt-2.5">
                      {isDropSet && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-amber-400/90 font-medium">
                            {t("form.dropSetHint", "Strip load immediately without rest between stages:")}
                          </p>

                          <div className="space-y-1.5">
                            {(setCfg.stages || []).map((stage, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-2 bg-background/50 border border-border/40 rounded-lg p-2"
                              >
                                <span className="text-[11px] font-mono font-semibold text-amber-400 w-32 shrink-0">
                                  {stage.stageLabel ||
                                    (sIdx === 0
                                      ? `Set ${setCfg.setNumber}.0 (Parent)`
                                      : `Set ${setCfg.setNumber}.${sIdx} (Break ${sIdx})`)}
                                </span>

                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step={0.5}
                                      min={0}
                                      value={stage.targetWeight ?? ""}
                                      onChange={(e) =>
                                        handleStageFieldChange(
                                          setCfg.setNumber,
                                          sIdx,
                                          "targetWeight",
                                          e.target.value,
                                        )
                                      }
                                      placeholder={t("form.loadPlaceholder", "Load")}
                                      className="w-full text-xs font-mono font-semibold bg-[#101418] border border-border/60 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-400"
                                    />
                                    <span className="text-[10px] text-muted-foreground font-mono">{t("form.kgUnit", "kg")}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={stage.targetReps ?? ""}
                                      onChange={(e) =>
                                        handleStageFieldChange(
                                          setCfg.setNumber,
                                          sIdx,
                                          "targetReps",
                                          e.target.value,
                                        )
                                      }
                                      placeholder={t("form.repsPlaceholderShort", "Reps")}
                                      className="w-full text-xs font-mono font-semibold bg-[#101418] border border-border/60 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-400"
                                    />
                                    <span className="text-[10px] text-muted-foreground font-mono">{t("form.repsUnit", "reps")}</span>
                                  </div>
                                </div>

                                {sIdx >= 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStage(setCfg.setNumber, sIdx)}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    title={`Remove Break Set ${setCfg.setNumber}.${sIdx}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddDropStage(setCfg.setNumber)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {t("actions.addBreakSet", "Add Break Set")}
                            </button>
                          </div>
                        </div>
                      )}

                      {isRestPause && (
                        <div className="space-y-2">
                          <p className="text-[11px] text-purple-400/90 font-medium">
                            {t("form.restPauseHint", "Initial effort to near-failure, followed by brief 10–15s pauses:")}
                          </p>

                          <div className="space-y-1.5">
                            {(setCfg.stages || []).map((stage, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-2 bg-background/50 border border-border/40 rounded-lg p-2"
                              >
                                <span className="text-[11px] font-mono font-semibold text-purple-400 w-28 shrink-0">
                                  {stage.stageLabel || `Effort ${sIdx + 1}`}
                                </span>

                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step={0.5}
                                      min={0}
                                      value={stage.targetWeight ?? ""}
                                      onChange={(e) =>
                                        handleStageFieldChange(
                                          setCfg.setNumber,
                                          sIdx,
                                          "targetWeight",
                                          e.target.value,
                                        )
                                      }
                                      placeholder={t("form.loadPlaceholder", "Load")}
                                      className="w-full text-xs font-mono font-semibold bg-[#101418] border border-border/60 rounded px-2 py-1 text-white focus:outline-none focus:border-purple-400"
                                    />
                                    <span className="text-[10px] text-muted-foreground font-mono">{t("form.kgUnit", "kg")}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={stage.targetReps ?? ""}
                                      onChange={(e) =>
                                        handleStageFieldChange(
                                          setCfg.setNumber,
                                          sIdx,
                                          "targetReps",
                                          e.target.value,
                                        )
                                      }
                                      placeholder={t("form.repsPlaceholderShort", "Reps")}
                                      className="w-full text-xs font-mono font-semibold bg-[#101418] border border-border/60 rounded px-2 py-1 text-white focus:outline-none focus:border-purple-400"
                                    />
                                    <span className="text-[10px] text-muted-foreground font-mono">{t("form.repsUnit", "reps")}</span>
                                  </div>
                                </div>

                                {sIdx >= 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStage(setCfg.setNumber, sIdx)}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    title={t("actions.removeEffort", "Remove Effort")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddRestPauseEffort(setCfg.setNumber)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {t("actions.addRestPauseEffort", "Add Rest-Pause Effort")}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isDropSet && !isRestPause && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground font-mono">{t("form.loadPlaceholder", "Load")}:</span>
                              <input
                                type="number"
                                step={0.5}
                                min={0}
                                value={setCfg.targetWeight ?? ""}
                                onChange={(e) =>
                                  handleSetFieldChange(
                                    setCfg.setNumber,
                                    "targetWeight",
                                    e.target.value,
                                  )
                                }
                                placeholder={targetWeight != null ? String(targetWeight) : "Auto"}
                                className="w-full text-xs font-mono font-semibold bg-[#101418] border border-border/60 rounded px-2 py-1 text-white focus:outline-none focus:border-[#5BE584]"
                              />
                              <span className="text-[10px] text-muted-foreground font-mono">{t("form.kgUnit", "kg")}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground font-mono">{t("form.repsPlaceholderShort", "Reps")}:</span>
                              <input
                                type="text"
                                value={setCfg.targetReps ?? ""}
                                onChange={(e) =>
                                  handleSetFieldChange(
                                    setCfg.setNumber,
                                    "targetReps",
                                    e.target.value,
                                  )
                                }
                                placeholder={targetReps || "8-10"}
                                className="w-full text-xs font-mono font-semibold bg-[#101418] border border-border/60 rounded px-2 py-1 text-white focus:outline-none focus:border-[#5BE584]"
                              />
                            </div>
                          </div>

                          <div className="pt-0.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSetTypeChange(setCfg.setNumber, "DROP_SET")}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors"
                              title={`Add a break set under Set ${setCfg.setNumber}.0`}
                            >
                              <Plus className="h-3 w-3" />
                              <span>{t("actions.addBreakSet", "Add Break Set")}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <FormTextarea
          control={control}
          name={`exercises.${index}.notes`}
          label={t("form.coachingNotes", "Coaching Notes")}
          placeholder={t("form.coachingNotesPlaceholder", "Add tempo, RPE targets, or execution cues...")}
          rows={2}
          className="resize-none"
        />
      </CardContent>
    </Card>
  );
}
