import { useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import type { Exercise } from "../types/exercise.types";
import { useAllExercises } from "../hooks/useExercises";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";

import ExercisesHeader from "../components/ExercisesHeader";
import ExerciseFilters, {
  type ExerciseSortOption,
} from "../components/ExerciseFilters";
import ExerciseTable from "../components/ExerciseTable";
import CreateExerciseDialog from "../components/CreateExerciseDialog";
import EditExerciseDialog from "../components/EditExerciseDialog";
import DeleteExerciseDialog from "../components/DeleteExerciseDialog";
import ViewExerciseDialog from "../components/ViewExerciseDialog";

const ITEMS_PER_PAGE = 10;

const DIFFICULTY_RANK: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function ExerciseRowSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1E2329] bg-[#101418]/90 p-5 animate-pulse">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex-1 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-48 rounded-md bg-[#1E2329]" />
            <div className="h-5 w-24 rounded-md bg-[#181D24]" />
            <div className="h-5 w-20 rounded-md bg-[#181D24]" />
          </div>
          <div className="h-3.5 w-3/4 rounded bg-[#181D24]" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 rounded-lg bg-[#1E2329]" />
            <div className="h-6 w-24 rounded-lg bg-[#181D24]" />
            <div className="h-6 w-20 rounded-lg bg-[#181D24]" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-[#1E2329]/60">
            <div className="h-8 w-24 rounded-xl bg-[#181D24]" />
            <div className="h-8 w-24 rounded-xl bg-[#181D24]" />
          </div>
        </div>
        <div className="h-32 w-full sm:w-44 rounded-xl bg-[#181D24] shrink-0" />
      </div>
    </div>
  );
}

const ExercisesPage = () => {
  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [onlyCustom, setOnlyCustom] = useState(false);
  const [sortBy, setSortBy] = useState<ExerciseSortOption>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog & Modal State
  const [openCreate, setOpenCreate] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null,
  );

  // Queries
  const { data: user } = useCurrentUser();
  const {
    data: allExercisesData,
    isLoading,
    isError,
    refetch,
  } = useAllExercises();

  const canModifyExercise = (exercise: Exercise) => {
    if (!user) return false;
    if (user.role === ROLES.ADMIN) return true;
    if (user.role === ROLES.TRAINER) {
      return !exercise.isCustom || exercise.createdById === user.id;
    }
    if (user.role === ROLES.MEMBER) {
      return Boolean(exercise.isCustom && exercise.createdById === user.id);
    }
    return false;
  };

  const allExercises: Exercise[] = allExercisesData?.exercises ?? [];

  const customCount = useMemo(
    () => allExercises.filter((ex) => ex.isCustom).length,
    [allExercises],
  );

  // Filter and sort across the complete library
  const filteredAndSortedExercises = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = allExercises.filter((exercise) => {
      if (onlyCustom && !exercise.isCustom) {
        return false;
      }

      if (
        selectedDifficulty !== "all" &&
        exercise.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()
      ) {
        return false;
      }

      if (selectedEquipment !== "all") {
        const hasEq = (exercise.equipment ?? []).some(
          (eq) => eq.toLowerCase() === selectedEquipment.toLowerCase(),
        );
        if (!hasEq) return false;
      }

      if (selectedMuscle !== "all") {
        const targetLower = selectedMuscle.toLowerCase();
        const inPrimary = (exercise.primaryMuscles ?? []).some(
          (m) => m.toLowerCase() === targetLower,
        );
        const inSecondary = (exercise.secondaryMuscles ?? []).some(
          (m) => m.toLowerCase() === targetLower,
        );
        if (!inPrimary && !inSecondary) return false;
      }

      if (query) {
        const matchesName = exercise.name.toLowerCase().includes(query);
        const matchesDesc = (exercise.description ?? "")
          .toLowerCase()
          .includes(query);
        const matchesPrimary = (exercise.primaryMuscles ?? []).some((m) =>
          m.toLowerCase().includes(query),
        );
        const matchesSecondary = (exercise.secondaryMuscles ?? []).some((m) =>
          m.toLowerCase().includes(query),
        );
        const matchesEq = (exercise.equipment ?? []).some((eq) =>
          eq.toLowerCase().includes(query),
        );

        if (
          !matchesName &&
          !matchesDesc &&
          !matchesPrimary &&
          !matchesSecondary &&
          !matchesEq
        ) {
          return false;
        }
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "difficulty") {
        const diffA = DIFFICULTY_RANK[a.difficulty?.toLowerCase()] ?? 99;
        const diffB = DIFFICULTY_RANK[b.difficulty?.toLowerCase()] ?? 99;
        if (diffA !== diffB) return diffA - diffB;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "muscle") {
        const muscA = a.primaryMuscles?.[0] ?? "ZZZ";
        const muscB = b.primaryMuscles?.[0] ?? "ZZZ";
        const cmp = muscA.localeCompare(muscB);
        if (cmp !== 0) return cmp;
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [
    allExercises,
    searchTerm,
    selectedMuscle,
    selectedEquipment,
    selectedDifficulty,
    onlyCustom,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedExercises.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const paginatedExercises = useMemo(() => {
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedExercises.slice(
      startIdx,
      startIdx + ITEMS_PER_PAGE,
    );
  }, [filteredAndSortedExercises, safePage]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setOnlyCustom(false);
    setSortBy("name-asc");
    setCurrentPage(1);
  };

  const handleRequestDelete = (exerciseId: string) => {
    const target = allExercises.find(
      (ex) => (ex.id || ex._id) === exerciseId,
    );
    if (target) {
      setDeletingExercise(target);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4 sm:px-6 space-y-6">
      {/* 1. Header Banner */}
      <ExercisesHeader
        onAddExercise={() => setOpenCreate(true)}
        totalExercises={allExercises.length}
        customCount={customCount}
      />

      {/* 2. Search, Muscle, Equipment, Difficulty & Sort Controls */}
      <ExerciseFilters
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedMuscle={selectedMuscle}
        onMuscleChange={(val) => {
          setSelectedMuscle(val);
          setCurrentPage(1);
        }}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={(val) => {
          setSelectedEquipment(val);
          setCurrentPage(1);
        }}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(val) => {
          setSelectedDifficulty(val);
          setCurrentPage(1);
        }}
        onlyCustom={onlyCustom}
        onOnlyCustomChange={(val) => {
          setOnlyCustom(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setCurrentPage(1);
        }}
        totalMatching={filteredAndSortedExercises.length}
        totalAll={allExercises.length}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Exercise Rows List / Loading Skeletons / Error State */}
      {isLoading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <ExerciseRowSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Unable to Load Exercise Library
          </h3>
          <p className="mx-auto max-w-md text-xs text-[#9CA3AF]">
            We encountered a network or server error while loading exercises.
            Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] hover:bg-[#49D472] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <ExerciseTable
          exercises={paginatedExercises}
          onEdit={setEditingExercise}
          onView={setViewingExercise}
          onDelete={handleRequestDelete}
          canModifyExercise={canModifyExercise}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* 4. Pagination Controls */}
      {!isLoading && !isError && filteredAndSortedExercises.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#1E2329] bg-[#101418]/90 px-5 py-3.5">
          <p className="text-xs text-[#9CA3AF]">
            Page <strong className="font-semibold text-white">{safePage}</strong>{" "}
            of <strong className="font-semibold text-white">{totalPages}</strong>{" "}
            • Showing{" "}
            <strong className="font-semibold text-white">
              {(safePage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(
                safePage * ITEMS_PER_PAGE,
                filteredAndSortedExercises.length,
              )}
            </strong>{" "}
            of{" "}
            <strong className="font-semibold text-white">
              {filteredAndSortedExercises.length}
            </strong>{" "}
            movements
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#F3F4F6] hover:border-[#5BE584]/40 hover:text-[#5BE584] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-mono font-bold transition-all ${
                      pageNum === safePage
                        ? "bg-[#5BE584] text-[#090B0F] shadow-[0_0_12px_rgba(91,229,132,0.25)]"
                        : "border border-[#1E2329] bg-[#090B0F] text-[#9CA3AF] hover:border-[#2A313A] hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={safePage >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#F3F4F6] hover:border-[#5BE584]/40 hover:text-[#5BE584] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Create Exercise Modal */}
      <CreateExerciseDialog open={openCreate} onOpenChange={setOpenCreate} />

      {/* 6. Edit Exercise Modal */}
      <EditExerciseDialog
        open={!!editingExercise}
        onOpenChange={(open) => {
          if (!open) setEditingExercise(null);
        }}
        exercise={editingExercise}
      />

      {/* 7. Quick View Exercise Modal */}
      <ViewExerciseDialog
        exercise={viewingExercise}
        onClose={() => setViewingExercise(null)}
      />

      {/* 8. Archive / Delete Confirmation Modal */}
      <DeleteExerciseDialog
        open={!!deletingExercise}
        onOpenChange={(open) => {
          if (!open) setDeletingExercise(null);
        }}
        exercise={deletingExercise}
      />
    </div>
  );
};

export default ExercisesPage;
