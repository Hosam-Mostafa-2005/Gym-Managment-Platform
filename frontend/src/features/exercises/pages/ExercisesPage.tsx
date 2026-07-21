import ExercisesHeader from "../components/ExercisesHeader";
import ExerciseFilters from "../components/ExerciseFilters";
import ExerciseTable from "../components/ExerciseTable";
import CreateExerciseDialog from "../components/CreateExerciseDialog";
import { useExercises } from "../hooks/useExercises";
import { useState } from "react";

const ExercisesPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const { data, isLoading } = useExercises();

  return (
    <div className="space-y-8 p-8">
      <ExercisesHeader onAddExercise={() => setOpenCreate(true)} />
      <CreateExerciseDialog open={openCreate} onOpenChange={setOpenCreate} />

      <ExerciseFilters />

      <ExerciseTable exercises={data ?? []} isLoading={isLoading} />
    </div>
  );
};

export default ExercisesPage;
