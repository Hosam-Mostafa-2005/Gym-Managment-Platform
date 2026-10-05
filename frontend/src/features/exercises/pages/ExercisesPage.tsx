import ExercisesHeader from "../components/ExercisesHeader";
import ExerciseFilters from "../components/ExerciseFilters";
import ExerciseTable from "../components/ExerciseTable";
import CreateExerciseDialog from "../components/CreateExerciseDialog";
import { useExercises } from "../hooks/useExercises";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ExercisesPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Items per page

  // Safely extract response properties based on your backend structure
  const { data, isLoading } = useExercises(currentPage, limit);

  const exercises = data?.exercises ?? [];
  const totalResults = data?.results ?? 0;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  const showingFrom = totalResults > 0 ? (currentPage - 1) * limit + 1 : 0;
  const showingTo = Math.min(currentPage * limit, totalResults);

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header component or wrapper */}
      <div className="relative z-10">
        <ExercisesHeader onAddExercise={() => setOpenCreate(true)} />
      </div>

      <CreateExerciseDialog open={openCreate} onOpenChange={setOpenCreate} />

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        {/* Filters Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Filter & Search
            </h2>
          </div>
          <ExerciseFilters />
        </section>

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        {/* Table Workspace */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Exercise Library
            </h2>
          </div>

          <div className="rounded-xl border border-[#1E2329] bg-[#101418]/50 overflow-hidden backdrop-blur-sm">
            <ExerciseTable exercises={exercises} isLoading={isLoading} />

            {/* Pagination Footer */}
            {!isLoading && exercises.length > 0 && (
              <div className="p-4 border-t border-[#1E2329] bg-[#101418] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
                <div>
                  Showing{" "}
                  <span className="font-medium text-[#F3F4F6]">
                    {showingFrom}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-[#F3F4F6]">
                    {showingTo}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[#F3F4F6]">
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
                    className="h-8 w-8 inline-flex items-center justify-center rounded border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white hover:border-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-3 py-1.5 rounded bg-[#1E2329]/50 text-[#F3F4F6] font-medium border border-[#1E2329]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8 inline-flex items-center justify-center rounded border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white hover:border-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExercisesPage;
