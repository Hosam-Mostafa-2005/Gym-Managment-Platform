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
      <DialogContent
        className="
    max-h-[90vh]
    w-[95vw]
    max-w-none
    overflow-y-auto
    rounded-3xl
    border
    border-border
    p-6
    shadow-2xl
    sm:max-w-4xl
    md:max-w-5xl
    lg:max-w-6xl
    sm:p-8
  "
      >
        <DialogHeader>
          <DialogTitle>Edit Exercise</DialogTitle>

          <DialogDescription>
            Update the details of the selected exercise.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground">
            Loading exercise...
          </p>
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
