import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import ExerciseForm from "../components/ExerciseForm";
import { useExercise } from "../hooks/useExercises";
import { useUpdateExercise } from "../hooks/useUpdateExercise";
import type { CreateExerciseDto } from "../types/exercise.types";
import { Button } from "@/components/ui/button";

const EditExercisePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: exercise, isLoading, isError } = useExercise(id, !!id);
  const { mutate: updateExercise, isPending } = useUpdateExercise();

  const handleSubmit = (data: CreateExerciseDto) => {
    if (!id) return;
    updateExercise(
      { id, data },
      {
        onSuccess: () => {
          navigate(`/workout-library/exercises/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#94A3B8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
        <p className="mt-4 text-sm font-medium">Loading exercise details...</p>
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">
          Exercise not found
        </h2>
        <p className="text-sm text-[#94A3B8]">
          The requested exercise could not be loaded for editing.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/workout-library/exercises")}
        >
          Back to Exercise Library
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="border-b border-[#2A3039] pb-6 space-y-1.5">
        <button
          type="button"
          onClick={() => navigate(`/workout-library/exercises/${id}`)}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Exercise
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Edit Exercise
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Update movement details, equipment requirements, and instructions for{" "}
          <span className="font-medium text-[#F8FAFC]">{exercise.name}</span>.
        </p>
      </div>

      <ExerciseForm
        initialValues={exercise}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
};

export default EditExercisePage;
