import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ExerciseForm from "./ExerciseForm";

import { useCreateExercise } from "../hooks/useCreateExercise";

import type { CreateExerciseDto } from "../types/exercise.types";

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateExerciseDialog = ({
  open,
  onOpenChange,
}: CreateExerciseDialogProps) => {
  const { mutate, isPending } = useCreateExercise();

  const handleSubmit = (data: CreateExerciseDto) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
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
          <DialogTitle>Create Exercise</DialogTitle>

          <DialogDescription>
            Add a new exercise to your exercise library.
          </DialogDescription>
        </DialogHeader>

        <ExerciseForm onSubmit={handleSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseDialog;
