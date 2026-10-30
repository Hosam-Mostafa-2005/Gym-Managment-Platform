import { Link } from "react-router-dom";
import {
  Dumbbell,
  Edit,
  ExternalLink,
  Eye,
  Layers,
  PlayCircle,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Exercise } from "../types/exercise.types";
import ExerciseImage from "./ExerciseImage";

interface ExerciseTableProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
  onView: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  canModifyExercise?: (exercise: Exercise) => boolean;
  onResetFilters?: () => void;
}

function getMovementCategory(
  exercise: Exercise,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string,
): string {
  const primary = (exercise.primaryMuscles || []).map((m) => m.toLowerCase());
  const secondary = (exercise.secondaryMuscles || []).map((m) =>
    m.toLowerCase(),
  );
  const isCompound = secondary.length >= 2 || primary.length >= 2;

  if (
    primary.some((m) =>
      ["quadriceps", "hamstrings", "glutes", "calves"].includes(m),
    )
  ) {
    return isCompound
      ? t("categories.lowerBodyCompound")
      : t("categories.lowerBodyIsolation");
  }
  if (primary.some((m) => ["core", "abs", "obliques"].includes(m))) {
    return t("categories.coreStability");
  }
  if (
    primary.some((m) =>
      ["chest", "shoulders", "anterior deltoids", "lateral deltoids"].includes(
        m,
      ),
    )
  ) {
    return isCompound
      ? t("categories.upperPushCompound")
      : t("categories.upperPushIsolation");
  }
  if (
    primary.some((m) =>
      ["back", "lats", "rear deltoids", "erector spinae", "traps"].includes(m),
    )
  ) {
    return isCompound
      ? t("categories.upperPullCompound")
      : t("categories.upperPullIsolation");
  }
  if (primary.some((m) => ["biceps", "triceps", "forearms"].includes(m))) {
    return isCompound
      ? t("categories.armCompound")
      : t("categories.armIsolation");
  }
  return isCompound
    ? t("categories.compoundMovement")
    : t("categories.targetedIsolation");
}

function getDifficultyBadgeStyle(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "intermediate":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    case "advanced":
      return "border-rose-500/30 bg-rose-500/10 text-rose-400";
    default:
      return "border-[#2A313A] bg-[#13181E] text-[#9CA3AF]";
  }
}

export default function ExerciseTable({
  exercises,
  onEdit,
  onView,
  onDelete,
  canModifyExercise,
  onResetFilters,
}: ExerciseTableProps) {
  const { t } = useTranslation(["exercises"]);

  if (exercises.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1E2329] bg-[#101418]/90 px-6 py-16 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5BE584]/25 bg-[#5BE584]/10 text-[#5BE584]">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-white">
          {t("empty.title", "No matching exercises found")}
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[#9CA3AF]">
          {t(
            "empty.description",
            "Try adjusting your search keywords, muscle group, equipment, or difficulty filters to see more movements from the training library.",
          )}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] hover:bg-[#49D472] transition-colors"
          >
            {t("empty.clearFilters", "Clear All Filters")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {exercises.map((exercise) => {
        const exerciseId = exercise.id || exercise._id || "";
        const canModify = canModifyExercise
          ? canModifyExercise(exercise)
          : true;
        const categoryLabel = getMovementCategory(exercise, t);
        const primaryMuscles = exercise.primaryMuscles ?? [];
        const secondaryMuscles = exercise.secondaryMuscles ?? [];
        const equipmentList = exercise.equipment ?? [];

        return (
          <article
            key={exerciseId}
            className="group relative overflow-hidden rounded-2xl border border-[#1E2329] bg-[#101418]/95 p-4 sm:p-5 shadow-md transition-all duration-200 hover:border-[#5BE584]/35 hover:bg-[#12171D] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          >
            {/* Subtle top accent line on hover */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#5BE584]/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              {/* =========================================================
                  LEFT SIDE: Exercise Name, Category, Muscles, Equipment & Actions
                 ========================================================= */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Title & Classification Badges */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(exercise)}
                      className="text-start text-base sm:text-lg font-bold tracking-tight text-white transition-colors hover:text-[#5BE584] focus:outline-none"
                    >
                      {exercise.name}
                    </button>

                    {/* Movement Pattern / Category Badge */}
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#252C35] bg-[#151A21] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      <Layers className="h-2.5 w-2.5 text-[#5BE584]" />
                      {categoryLabel}
                    </span>

                    {/* Difficulty Badge */}
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getDifficultyBadgeStyle(
                        exercise.difficulty,
                      )}`}
                    >
                      {t(
                        `difficulties.${exercise.difficulty?.toLowerCase()}`,
                        exercise.difficulty,
                      )}
                    </span>

                    {/* Custom Exercise Badge */}
                    {exercise.isCustom && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#5BE584]/35 bg-[#5BE584]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5BE584]">
                        <Sparkles className="h-2.5 w-2.5" />
                        {t("card.customBadge", "Custom")}
                      </span>
                    )}

                    {/* Video Tutorial Indicator */}
                    {exercise.videoUrl && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                        <PlayCircle className="h-2.5 w-2.5" />
                        {t("card.videoBadge", "Video")}
                      </span>
                    )}
                  </div>

                  {/* Description Preview */}
                  {exercise.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#9CA3AF]">
                      {exercise.description}
                    </p>
                  )}
                </div>

                {/* Target Muscles & Equipment Pills */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5">
                  {/* Primary & Secondary Muscles */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B7280] me-0.5">
                      <Target className="h-3 w-3 text-[#5BE584]" />
                      {t("card.musclesLabel", "Muscles:")}
                    </span>
                    {primaryMuscles.map((muscle) => (
                      <span
                        key={`primary-${muscle}`}
                        className="inline-flex items-center rounded-lg border border-[#5BE584]/30 bg-[#5BE584]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#5BE584]"
                      >
                        {t(`muscles.${muscle}`, muscle)}
                      </span>
                    ))}
                    {secondaryMuscles.map((muscle) => (
                      <span
                        key={`secondary-${muscle}`}
                        className="inline-flex items-center rounded-lg border border-[#1E2329] bg-[#090B0F] px-2 py-0.5 text-[11px] font-medium text-[#9CA3AF]"
                        title={t(
                          "card.secondaryTargetTooltip",
                          "Secondary target muscle",
                        )}
                      >
                        {t(`muscles.${muscle}`, muscle)}
                      </span>
                    ))}
                  </div>

                  {/* Equipment Badges */}
                  {equipmentList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B7280] me-0.5">
                        <Dumbbell className="h-3 w-3 text-[#9CA3AF]" />
                        {t("card.equipmentLabel", "Equipment:")}
                      </span>
                      {equipmentList.map((eq) => (
                        <span
                          key={eq}
                          className="inline-flex items-center rounded-lg border border-[#262D36] bg-[#141920] px-2.5 py-0.5 text-[11px] font-medium text-[#E5E7EB]"
                        >
                          {t(`equipment.${eq}`, eq)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Action Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E2329]/70">
                  <button
                    type="button"
                    onClick={() => onView(exercise)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#262D36] bg-[#141920] px-3 py-1.5 text-xs font-semibold text-[#F3F4F6] transition-all hover:border-[#5BE584]/50 hover:bg-[#16291D] hover:text-[#5BE584]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t("card.quickView", "Quick View")}
                  </button>

                  <Link
                    to={`/workout-library/exercises/${exerciseId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-all hover:border-[#2A313A] hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("card.fullGuide", "Full Guide")}
                  </Link>

                  {canModify && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(exercise)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-all hover:border-[#5BE584]/40 hover:text-[#5BE584]"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        {t("card.edit", "Edit")}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(exerciseId)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("card.delete", "Delete")}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* =========================================================
                  RIGHT SIDE: Framed Exercise Image (White Surface + Uncropped)
                 ========================================================= */}
              <button
                type="button"
                onClick={() => onView(exercise)}
                className="group/img relative self-stretch sm:self-center shrink-0 focus:outline-none"
                title={t("card.viewDetailsTitle", {
                  name: exercise.name,
                  defaultValue: `View ${exercise.name} details`,
                })}
              >
                <ExerciseImage
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  size="custom"
                  fit="contain"
                  interactive
                  className="h-44 w-full sm:h-32 sm:w-44 md:h-36 md:w-48 rounded-xl border-[#2A313A] transition-all duration-200 group-hover:border-[#5BE584]/50 group-hover:shadow-[0_0_20px_rgba(91,229,132,0.12)]"
                />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
