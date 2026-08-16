import { History, Clock, Dumbbell, Activity, ArrowUpRight } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import type { WorkoutSession } from "@/features/workout-sessions/types/workout-session.types";

interface LastWorkoutCardProps {
  lastWorkout: WorkoutSession | null | undefined;
  navigate: NavigateFunction;
}

export const LastWorkoutCard = ({
  lastWorkout,
  navigate,
}: LastWorkoutCardProps) => {
  return (
    <div className="bg-[#11151B] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-[#5BE584]/20 hover:-translate-y-1 flex flex-col justify-between h-full min-h-[280px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#5BE584]" />
            <h2 className="text-lg font-semibold text-white">Last Workout</h2>
          </div>
          {lastWorkout && (
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                lastWorkout.status === "COMPLETED"
                  ? "bg-[#5BE584]/10 text-[#5BE584]"
                  : "bg-white/10 text-zinc-300"
              }`}
            >
              {lastWorkout.status.replace("_", " ")}
            </span>
          )}
        </div>

        {lastWorkout ? (
          <div className="space-y-6 mt-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {lastWorkout.assignment?.workout?.title || "Freestyle Session"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-semibold">
                  Duration
                </p>
                <p className="text-white font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-400" />{" "}
                  {lastWorkout.duration} min
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-semibold">
                  Exercises
                </p>
                <p className="text-white font-medium flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-zinc-400" />{" "}
                  {lastWorkout.exercisesCompleted}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-2 font-medium">
                <span>Progress</span>
                <span>{lastWorkout.progress || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5BE584] rounded-full transition-all"
                  style={{ width: `${lastWorkout.progress || 0}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Activity className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-zinc-400">No recent workout session found.</p>
          </div>
        )}
      </div>

      {lastWorkout && (
        <button
          onClick={() => navigate(`/sessions/${lastWorkout.id}`)}
          className="mt-8 w-full flex items-center justify-between bg-white/5 border border-white/10 text-white px-5 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
        >
          <span>View Session</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
