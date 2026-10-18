import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";

interface ExercisesHeaderProps {
  onAddExercise: () => void;
}

const ExercisesHeader = ({ onAddExercise }: ExercisesHeaderProps) => {
  const { data: user } = useCurrentUser();
  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.TRAINER;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
          Exercise Library
        </h1>

        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Browse movement demonstrations, target muscles, and coaching cues.
        </p>
      </div>

      {canManage && (
        <Button className="gap-2 self-start sm:self-auto" onClick={onAddExercise}>
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      )}
    </div>
  );
};

export default ExercisesHeader;
