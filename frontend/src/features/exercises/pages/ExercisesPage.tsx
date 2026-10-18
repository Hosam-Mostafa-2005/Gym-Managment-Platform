import ExercisesHeader from "../components/ExercisesHeader";
import ExerciseFilters from "../components/ExerciseFilters";
import ExerciseTable from "../components/ExerciseTable";
import CreateExerciseDialog from "../components/CreateExerciseDialog";
import { useExercises } from "../hooks/useExercises";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ExercisesPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10; // Items per page

  // Safely extract response properties based on your backend structure
  const { data, isLoading } = useExercises(currentPage, limit);

  const exercises = data?.exercises ?? [];
  const totalResults = data?.results ?? 0;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((ex) => {
      const nameMatch = ex.name?.toLowerCase().includes(query);
      const descMatch = ex.description?.toLowerCase().includes(query);
      const difficultyMatch = ex.difficulty?.toLowerCase().includes(query);
      const primaryMatch = ex.primaryMuscles?.some((m) =>
        m.toLowerCase().includes(query),
      );
      const secondaryMatch = ex.secondaryMuscles?.some((m) =>
        m.toLowerCase().includes(query),
      );
      const equipmentMatch = ex.equipment?.some((eq) =>
        eq.toLowerCase().includes(query),
      );
      return (
        nameMatch ||
        descMatch ||
        difficultyMatch ||
        primaryMatch ||
        secondaryMatch ||
        equipmentMatch
      );
    });
  }, [exercises, search]);

  const showingFrom = totalResults > 0 ? (currentPage - 1) * limit + 1 : 0;
  const showingTo = Math.min(currentPage * limit, totalResults);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-16">
      <ExercisesHeader onAddExercise={() => setOpenCreate(true)} />

      <CreateExerciseDialog open={openCreate} onOpenChange={setOpenCreate} />

      {/* Filters Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
          Filter & Search
        </h2>
        <ExerciseFilters search={search} onSearchChange={setSearch} />
      </section>

      <div className="h-px w-full bg-[#2A3039]" />

      {/* Table Workspace */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
            Exercise Library
          </h2>
          {search.trim() && (
            <span className="text-xs text-[#94A3B8]">
              Found{" "}
              <span className="font-semibold text-[#F8FAFC]">
                {filteredExercises.length}
              </span>{" "}
              matching on this page
            </span>
          )}
        </div>

        <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <ExerciseTable exercises={filteredExercises} isLoading={isLoading} />

          {/* Pagination Footer */}
          {!isLoading && exercises.length > 0 && (
            <div className="p-4 border-t border-[#2A3039] bg-[#090B0F]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
              <div>
                Showing{" "}
                <span className="font-medium text-[#F8FAFC]">{showingFrom}</span>{" "}
                to{" "}
                <span className="font-medium text-[#F8FAFC]">{showingTo}</span>{" "}
                of{" "}
                <span className="font-medium text-[#F8FAFC]">
                  {totalResults}
                </span>{" "}
                results
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-[10px] border border-[#2A3039] bg-[#13171D] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#5BE584]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-3 py-1.5 rounded-[10px] bg-[#13171D] text-[#F8FAFC] font-medium border border-[#2A3039]">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-[10px] border border-[#2A3039] bg-[#13171D] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#5BE584]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExercisesPage;
