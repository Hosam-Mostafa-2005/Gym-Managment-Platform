import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

import ExerciseForm from "./ExerciseForm";

import { useCreateExercise } from "../hooks/useCreateExercise";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";

import type { CreateExerciseDto } from "../types/exercise.types";

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateExerciseDialog = ({
  open,
  onOpenChange,
}: CreateExerciseDialogProps) => {
  const { t } = useTranslation(["exercises"]);
  const { data: user } = useCurrentUser();
  const isMember = user?.role === ROLES.MEMBER;
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
          max-h-[92dvh]
          w-[95vw]
          max-w-none
          overflow-y-auto
          overscroll-contain
          rounded-2xl
          border
          border-border
          p-4
          sm:p-8
          shadow-2xl
          sm:max-w-4xl
          md:max-w-5xl
          lg:max-w-6xl
        "
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold">
            {isMember
              ? t("create.createCustomTitle", "Create Custom Exercise")
              : t("create.title", "Create Exercise")}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm">
            {isMember
              ? t(
                  "create.customSubtitle",
                  "Add a personal custom exercise to your training library.",
                )
              : t(
                  "create.subtitle",
                  "Add a new exercise to your exercise library.",
                )}
          </DialogDescription>
        </DialogHeader>

        <ExerciseForm onSubmit={handleSubmit} isPending={isPending} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseDialog;
