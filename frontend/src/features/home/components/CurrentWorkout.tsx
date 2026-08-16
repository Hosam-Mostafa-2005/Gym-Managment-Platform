import { Activity, ChevronRight, CheckCircle2 } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";

export const CurrentWorkout = ({
  currentSession,
  navigate,
}: {
  currentSession: any;
  navigate: NavigateFunction;
}) => {
  if (!currentSession) return null;

  const progress = currentSession.session.progress || 0;

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#5BE584]/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-[#5BE584]" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Current Session
        </h2>
      </div>

      <div className="bg-[#11151B] border border-white/5 rounded-2xl p-8 md:p-10 hover:-translate-y-1 hover:border-[#5BE584]/30 transition-all duration-300 relative overflow-hidden shadow-xl shadow-black/20">
        <div
          className="absolute top-0 left-0 h-1.5 bg-[#5BE584] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex-1 w-full">
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
              {currentSession.session.assignment?.workout?.title ||
                "Active Workout"}
            </h3>

            <div className="flex items-center gap-6 text-zinc-400 text-base mb-8">
              <span className="flex items-center gap-2 text-white font-medium">
                <CheckCircle2 className="w-5 h-5 text-[#5BE584]" />{" "}
                {currentSession.session.exercisesCompleted || 0} Exercises
                Completed
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span>{currentSession.session.duration} min elapsed</span>
            </div>

            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#5BE584] h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => navigate(`/sessions/${currentSession.session.id}`)}
            className="flex items-center justify-center gap-3 bg-[#5BE584] text-[#090B0F] px-8 py-5 rounded-2xl font-bold hover:bg-[#4dd273] transition-all duration-300 w-full md:w-auto shrink-0 text-lg shadow-lg shadow-[#5BE584]/20"
          >
            Continue Workout
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
