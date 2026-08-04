import type { ReactNode } from "react";
import { Dumbbell, CheckCircle2, Circle } from "lucide-react";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

interface ExerciseCardProps {
  exercise: WorkoutExerciseLog;
  children?: ReactNode;
}

export default function ExerciseCard({
  exercise,
  children,
}: ExerciseCardProps) {
  return (
    <section className="bg-[#11151B] border border-white/5 rounded-2xl p-6 shadow-sm transition-colors hover:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {exercise.exerciseName}
          </h2>

          <div className="flex items-center gap-1.5 mt-2 text-sm text-[#9CA3AF] font-medium">
            <Dumbbell size={14} />
            <span>
              {exercise.targetSets} Sets × {exercise.targetReps}
            </span>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            exercise.completed
              ? "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]"
              : "bg-white/5 border-white/5 text-[#9CA3AF]"
          }`}
        >
          {exercise.completed ? (
            <CheckCircle2 size={14} />
          ) : (
            <Circle size={14} />
          )}
          {exercise.completed ? "Completed" : "In Progress"}
        </div>
      </div>

      {children && (
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-4 px-4 pb-3 border-b border-white/5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
            <div>Set</div>
            <div>Target</div>
            <div>kg</div>
            <div>Reps</div>
          </div>
          <div className="mt-3 space-y-2">{children}</div>
        </div>
      )}
    </section>
  );
}
