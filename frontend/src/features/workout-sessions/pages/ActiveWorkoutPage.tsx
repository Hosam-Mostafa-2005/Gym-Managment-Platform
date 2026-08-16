import { Link } from "react-router-dom";
import WorkoutHeader from "../components/WorkoutHeader";
import ExerciseCard from "../components/ExerciseCard";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
import SetRow from "../components/SetRow";
import { useCurrentWorkoutSession } from "../hooks/useCurrentWorkoutSession";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

export default function ActiveWorkoutPage() {
  const { data, isLoading } = useCurrentWorkoutSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090B0F] flex justify-center items-center">
        <span className="w-8 h-8 border-2 border-[#5BE584] border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  if (!data || !data.session) {
    return (
      <div className="min-h-screen bg-[#090B0F] flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-[#11151B] border border-white/5 rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
          <p className="text-[#9CA3AF] mb-6 font-medium">
            No active workout session.
          </p>
          <Link
            to="/workouts"
            className="inline-flex items-center justify-center bg-[#5BE584] text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity w-full"
          >
            Return to Workouts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B0F] text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8 md:py-12">
        <WorkoutHeader session={data.session} />

        <section className="space-y-6">
          {data.exerciseLogs.map((exercise: WorkoutExerciseLog) => (
            <ExerciseCard key={exercise.id} exercise={exercise}>
              {exercise.sets.map((set) => (
                <SetRow key={set.id} set={set} />
              ))}
            </ExerciseCard>
          ))}
        </section>

        <FinishWorkoutDialog sessionId={data.session.id} />
      </div>
    </div>
  );
}
