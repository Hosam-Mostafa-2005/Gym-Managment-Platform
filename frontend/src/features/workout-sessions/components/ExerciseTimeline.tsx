import { CheckCircle2, Circle } from "lucide-react";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

interface ExerciseTimelineProps {
  exercises: WorkoutExerciseLog[];
}

export default function ExerciseTimeline({ exercises }: ExerciseTimelineProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-bold text-white tracking-tight px-1">
        Exercise Timeline
      </h2>

      <div className="space-y-6 border-l-2 border-white/5 ml-3 pl-6">
        {exercises.map((exercise: any) => (
          <div key={exercise.id || exercise._id} className="relative group">
            <div
              className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ring-4 ring-[#090B0F] transition-colors ${
                exercise.completed
                  ? "bg-[#5BE584]"
                  : "bg-[#11151B] border-2 border-white/20"
              }`}
            ></div>

            <div className="bg-[#11151B] border border-white/5 rounded-2xl p-5 shadow-sm transition-colors group-hover:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">
                  {exercise.exerciseName}
                </h3>
                <p className="mt-1 text-sm text-[#9CA3AF] font-medium">
                  {exercise.targetSets} Sets × {exercise.targetReps}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border w-fit ${
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
                {exercise.completed ? "Completed" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
