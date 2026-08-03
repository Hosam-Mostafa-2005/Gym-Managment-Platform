import ExercisesHeader from "../components/ExercisesHeader";
import ExerciseFilters from "../components/ExerciseFilters";
import ExerciseTable from "../components/ExerciseTable";
import CreateExerciseDialog from "../components/CreateExerciseDialog";
import { useExercises } from "../hooks/useExercises";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const ExercisesPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Items per page

  const { data, isLoading } = useExercises(currentPage, limit);

  // Safely extract response properties based on your backend structure
  const exercises = data?.data?.exercises ?? [];
  const totalResults = data?.results ?? 0;
  const totalPages = Math.ceil(totalResults / limit) || 1;

  return (
    <div className="space-y-8 p-8">
      <ExercisesHeader onAddExercise={() => setOpenCreate(true)} />
      <CreateExerciseDialog open={openCreate} onOpenChange={setOpenCreate} />

      <ExerciseFilters />

      <ExerciseTable exercises={exercises} isLoading={isLoading} />

      {/* Pagination Controls Footer */}
      {!isLoading && exercises.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * limit + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * limit, totalResults)}
            </span>{" "}
            of <span className="font-medium">{totalResults}</span> results
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 px-2 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesPage;
