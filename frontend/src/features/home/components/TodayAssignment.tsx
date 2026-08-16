import { Target, ArrowRight, User, Calendar, Flame } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";

export const TodayAssignment = ({
  assignment,
  navigate,
}: {
  assignment: any;
  navigate: NavigateFunction;
}) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#5BE584]/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-[#5BE584]" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Today's Assignment
        </h2>
      </div>

      {assignment ? (
        <div className="bg-[#11151B] border border-white/5 rounded-2xl p-8 md:p-10 hover:-translate-y-1 hover:border-white/10 transition-all duration-300 shadow-xl shadow-black/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-[#5BE584]/10 text-[#5BE584] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {assignment.status}
                </span>
              </div>
              <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
                {assignment.workout?.title || "Assigned Workout"}
              </h3>
              <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-base">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" /> {assignment.trainer?.name}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />{" "}
                  {new Date(assignment.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/assignments/${assignment.id}`)}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-5 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 w-full md:w-auto shrink-0 text-lg"
            >
              Open Assignment
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#11151B] border border-white/5 rounded-2xl p-16 text-center flex flex-col items-center justify-center">
          <Flame className="w-16 h-16 text-zinc-700 mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-3">
            No Assignment Today
          </h3>
          <p className="text-zinc-500 text-lg">
            Take a rest day or explore freestyle workouts.
          </p>
        </div>
      )}
    </section>
  );
};
