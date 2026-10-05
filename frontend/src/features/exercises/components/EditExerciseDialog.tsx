import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ExerciseForm from "./ExerciseForm";
import { useExercise } from "../hooks/useExercises";
import { useUpdateExercise } from "../hooks/useUpdateExercise";
import { Loader2 } from "lucide-react";

import type { Exercise, CreateExerciseDto } from "../types/exercise.types";

interface EditExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
}

const EditExerciseDialog = ({
  open,
  onOpenChange,
  exercise,
}: EditExerciseDialogProps) => {
  const { mutate, isPending } = useUpdateExercise();
  const { data: exerciseDetails, isLoading } = useExercise(
    exercise?.id ?? "",
    open,
  );

  const handleSubmit = (data: CreateExerciseDto) => {
    if (!exercise) return;

    mutate(
      {
        id: exercise.id,
        data,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-none overflow-y-auto rounded-xl border border-[#1E2329] bg-[#101418] p-6 shadow-2xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl sm:p-8 text-[#F3F4F6] selection:bg-[#5BE584]/30">
        <DialogHeader className="border-b border-[#1E2329] pb-4 mb-6">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase mb-1">
            <span>Exercises</span>
            <span>/</span>
            <span className="text-[#F3F4F6]">Edit Exercise</span>
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight text-white">
            Edit Exercise
          </DialogTitle>
          <DialogDescription className="text-xs text-[#9CA3AF] mt-1">
            Update the details and movement specifications of the selected
            exercise.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#6B7280]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
            <p className="mt-4 text-sm font-medium">
              Loading exercise details...
            </p>
          </div>
        ) : (
          <ExerciseForm
            initialValues={exerciseDetails}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditExerciseDialog;
