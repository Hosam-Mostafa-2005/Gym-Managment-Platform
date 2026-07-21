import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteExercise } from "../hooks/useDeleteExercise";
import type { Exercise } from "../types/exercise.types";
import { AlertTriangle, Archive } from "lucide-react";

interface DeleteExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
}

const DeleteExerciseDialog: React.FC<DeleteExerciseDialogProps> = ({
  open,
  onOpenChange,
  exercise,
}) => {
  const { mutate, isPending } = useDeleteExercise();

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default to stop Shadcn from auto-closing the modal before mutation succeeds
    e.preventDefault();

    if (!exercise) return;

    mutate(exercise.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!exercise) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        <AlertDialogHeader className="space-y-4 text-left">
          {/* Header with Glowing Warning Icon */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500 dark:bg-amber-500/15">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl font-extrabold tracking-tight text-foreground">
                Archive Exercise
              </AlertDialogTitle>
            </div>
          </div>

          {/* Description Body */}
          <AlertDialogDescription className="space-y-3 pt-1 text-base leading-relaxed text-muted-foreground">
            <p>
              Are you sure you want to archive{" "}
              <span className="font-semibold text-foreground underline decoration-amber-500/60 underline-offset-4">
                "{exercise.name}"
              </span>
              ?
            </p>

            {/* Explanatory Info Box */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/40 p-3.5 text-sm text-muted-foreground">
              <Archive className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/80" />
              <span>
                This exercise will no longer appear in the active exercises
                list, but it can be restored later.
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Action Buttons */}
        <AlertDialogFooter className="mt-6 gap-3 sm:gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="rounded-xl border-border bg-transparent font-medium hover:bg-muted"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-xl bg-amber-600 font-medium text-white transition-all hover:bg-amber-700 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400"
          >
            {isPending ? "Archiving..." : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteExerciseDialog;
