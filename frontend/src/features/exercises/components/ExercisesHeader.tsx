import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ExercisesHeaderProps {
  onAddExercise: () => void;
}

const ExercisesHeader = ({ onAddExercise }: ExercisesHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your exercise library and keep your workouts organized.
        </p>
      </div>

      <Button className="gap-2 rounded-xl" onClick={onAddExercise}>
        <Plus className="h-4 w-4" />
        Add Exercise
      </Button>
    </div>
  );
};

export default ExercisesHeader;
