import React from "react";
import { Link } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import { Dumbbell, Flame, Clock, ArrowRight } from "lucide-react";

export const Features = ({
  workouts,
  exercises,
  navigate,
}: {
  workouts: any[];
  exercises: any[];
  navigate: NavigateFunction;
}) => {
  return (
    <div className="space-y-24">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Featured Workouts
          </h2>
          <Link
            to="/workouts"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-base font-medium"
          >
            View All <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {workouts.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workouts/${w.id}`)}
              className="bg-[#11151B] border border-white/5 rounded-2xl p-8 hover:-translate-y-1 hover:border-[#5BE584]/20 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <Flame className="w-6 h-6 text-[#5BE584]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/5 text-zinc-300 px-4 py-1.5 rounded-full">
                    {w.difficulty}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  {w.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-base text-zinc-500 font-medium mt-6">
                <Clock className="w-5 h-5" /> {w.estimatedDuration} min
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Exercise Library
          </h2>
          <Link
            to="/exercises"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-base font-medium"
          >
            View All <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => navigate(`/exercises/${ex.id}`)}
              className="bg-[#11151B] border border-white/5 rounded-2xl p-8 hover:-translate-y-1 hover:border-white/10 transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-5 text-[#5BE584]">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white text-base mb-2">
                {ex.name}
              </h3>
              <p className="text-sm text-zinc-400 mb-3">
                {ex.primaryMuscles?.[0] || "General"}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                {ex.equipment?.[0] || "None"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
