import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  ALL_MUSCLE_CATEGORIES,
} from "../constants/exercise.constants";

export type ExerciseSortOption =
  | "name-asc"
  | "name-desc"
  | "difficulty"
  | "muscle";

interface ExerciseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMuscle?: string;
  onMuscleChange?: (value: string) => void;
  selectedEquipment?: string;
  onEquipmentChange?: (value: string) => void;
  selectedDifficulty?: string;
  onDifficultyChange?: (value: string) => void;
  onlyCustom?: boolean;
  onOnlyCustomChange?: (value: boolean) => void;
  sortBy?: ExerciseSortOption;
  onSortByChange?: (value: ExerciseSortOption) => void;
  totalMatching?: number;
  totalAll?: number;
  onResetFilters?: () => void;
}

const FILTER_MUSCLES = [...ALL_MUSCLE_CATEGORIES];

export default function ExerciseFilters({
  searchTerm,
  onSearchChange,
  selectedMuscle = "all",
  onMuscleChange,
  selectedEquipment = "all",
  onEquipmentChange,
  selectedDifficulty = "all",
  onDifficultyChange,
  onlyCustom = false,
  onOnlyCustomChange,
  sortBy = "name-asc",
  onSortByChange,
  totalMatching,
  totalAll,
  onResetFilters,
}: ExerciseFiltersProps) {
  const { t } = useTranslation(["exercises"]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedMuscle !== "all" ||
    selectedEquipment !== "all" ||
    selectedDifficulty !== "all" ||
    onlyCustom;

  return (
    <div className="rounded-2xl border border-[#1E2329] bg-[#101418]/95 p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Top Row: Search Bar + Selects */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder={t(
              "filters.searchPlaceholder",
              "Search exercises by name, target muscle, or equipment...",
            )}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#1E2329] bg-[#090B0F] ps-10 pe-9 text-sm text-[#F3F4F6] placeholder:text-[#6B7280] focus:border-[#5BE584]/60 focus:outline-none focus:ring-2 focus:ring-[#5BE584]/15 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#6B7280] hover:bg-[#1E2329] hover:text-white transition-colors"
              title={t("filters.clearSearch", "Clear search")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:w-auto">
          {/* Muscle Group Select */}
          {onMuscleChange && (
            <select
              value={selectedMuscle}
              onChange={(e) => onMuscleChange(e.target.value)}
              aria-label={t(
                "filters.filterByMuscleAria",
                "Filter by muscle group",
              )}
              className="h-11 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 text-xs font-medium text-[#F3F4F6] focus:border-[#5BE584]/60 focus:outline-none focus:ring-2 focus:ring-[#5BE584]/15 transition-all cursor-pointer"
            >
              <option value="all">
                {t("filters.allMuscleGroups", "All Muscle Groups")}
              </option>
              {FILTER_MUSCLES.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {t(`muscles.${muscle}`, muscle)}
                </option>
              ))}
            </select>
          )}

          {/* Equipment Select */}
          {onEquipmentChange && (
            <select
              value={selectedEquipment}
              onChange={(e) => onEquipmentChange(e.target.value)}
              aria-label={t("filters.filterByEquipmentAria", "Filter by equipment")}
              className="h-11 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 text-xs font-medium text-[#F3F4F6] focus:border-[#5BE584]/60 focus:outline-none focus:ring-2 focus:ring-[#5BE584]/15 transition-all cursor-pointer"
            >
              <option value="all">
                {t("filters.allEquipment", "All Equipment")}
              </option>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>
                  {t(`equipment.${eq}`, eq)}
                </option>
              ))}
            </select>
          )}

          {/* Sort By Select */}
          {onSortByChange && (
            <select
              value={sortBy}
              onChange={(e) =>
                onSortByChange(e.target.value as ExerciseSortOption)
              }
              aria-label={t("filters.sort.ariaLabel", "Sort exercises")}
              className="h-11 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3.5 text-xs font-medium text-[#F3F4F6] focus:border-[#5BE584]/60 focus:outline-none focus:ring-2 focus:ring-[#5BE584]/15 transition-all cursor-pointer"
            >
              <option value="name-asc">
                {t("filters.sort.nameAsc", "Sort: Name (A → Z)")}
              </option>
              <option value="name-desc">
                {t("filters.sort.nameDesc", "Sort: Name (Z → A)")}
              </option>
              <option value="muscle">
                {t("filters.sort.muscle", "Sort: Primary Muscle")}
              </option>
              <option value="difficulty">
                {t("filters.sort.difficulty", "Sort: Difficulty Level")}
              </option>
            </select>
          )}
        </div>
      </div>

      {/* Quick Muscle Category Chips */}
      {onMuscleChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] me-1 shrink-0">
            {t("filters.muscleLabel", "Muscle:")}
          </span>
          <button
            type="button"
            onClick={() => onMuscleChange("all")}
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedMuscle === "all"
                ? "bg-[#5BE584] text-[#090B0F] font-bold shadow-[0_0_12px_rgba(91,229,132,0.25)]"
                : "border border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
            }`}
          >
            {t("filters.all", "All")}
          </button>
          {FILTER_MUSCLES.map((muscle) => {
            const isActive =
              selectedMuscle.toLowerCase() === muscle.toLowerCase();
            return (
              <button
                key={muscle}
                type="button"
                onClick={() => onMuscleChange(isActive ? "all" : muscle)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#5BE584] text-[#090B0F] font-bold shadow-[0_0_12px_rgba(91,229,132,0.25)]"
                    : "border border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
                }`}
              >
                {t(`muscles.${muscle}`, muscle)}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Row: Difficulty Pills + Custom Toggle + Results Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E2329]/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] me-1">
            <SlidersHorizontal className="h-3 w-3 text-[#5BE584]" />
            {t("filters.levelLabel", "Level:")}
          </span>

          {onDifficultyChange && (
            <>
              <button
                type="button"
                onClick={() => onDifficultyChange("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedDifficulty === "all"
                    ? "bg-[#5BE584] text-[#090B0F] font-semibold shadow-[0_0_12px_rgba(91,229,132,0.25)]"
                    : "border border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
                }`}
              >
                {t("filters.all", "All")}
              </button>
              {DIFFICULTY_OPTIONS.map((diff) => {
                const isActive = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onDifficultyChange(isActive ? "all" : diff)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                      isActive
                        ? "bg-[#5BE584] text-[#090B0F] font-semibold shadow-[0_0_12px_rgba(91,229,132,0.25)]"
                        : "border border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
                    }`}
                  >
                    {t(`difficulties.${diff}`, diff)}
                  </button>
                );
              })}
            </>
          )}

          {onOnlyCustomChange && (
            <button
              type="button"
              onClick={() => onOnlyCustomChange(!onlyCustom)}
              className={`ms-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                onlyCustom
                  ? "border border-[#5BE584]/50 bg-[#5BE584]/15 text-[#5BE584] font-semibold"
                  : "border border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              {t("filters.myCustom", "My Custom")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {typeof totalMatching === "number" && (
            <span className="text-xs text-[#9CA3AF]">
              <Trans
                i18nKey={
                  typeof totalAll === "number" && totalAll !== totalMatching
                    ? "filters.showingCount"
                    : "filters.showingCountSingle"
                }
                ns="exercises"
                values={{ count: totalMatching, total: totalAll }}
                components={{
                  1: <strong className="font-semibold text-white" />,
                  3: <strong className="font-semibold text-white" />,
                }}
              />
            </span>
          )}

          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-[#2A313A] bg-[#13181E] px-2.5 py-1 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/40 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
              {t("filters.resetFilters", "Reset Filters")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
