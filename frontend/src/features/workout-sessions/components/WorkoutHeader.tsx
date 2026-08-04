import { Clock, User, Activity } from "lucide-react";
import type { WorkoutSession } from "../types/workout-session.types";

interface WorkoutHeaderProps {
  session: WorkoutSession;
}

export default function WorkoutHeader({ session }: WorkoutHeaderProps) {
  return (
    <header className="bg-[#11151B] border border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {session.assignment.workout.title}
          </h1>
          <div className="flex items-center gap-2 mt-3 text-sm text-[#9CA3AF]">
            <User size={16} className="text-white/40" />
            <span>Coach {session.assignment.trainer.name}</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-6 bg-[#090B0F] p-4 rounded-xl border border-white/5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold">
              Status
            </span>
            <span
              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border ${
                session.status === "IN_PROGRESS"
                  ? "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]"
                  : session.status === "COMPLETED"
                    ? "bg-white/5 border-white/5 text-[#9CA3AF]"
                    : "bg-orange-400/10 border-orange-400/20 text-orange-400"
              }`}
            >
              {session.status === "IN_PROGRESS" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#5BE584] mr-2 animate-pulse"></span>
              )}
              {session.status === "IN_PROGRESS"
                ? "In Progress"
                : session.status}
            </span>
          </div>

          <div className="w-px h-10 bg-white/10 hidden md:block"></div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Clock size={14} /> Duration
            </span>
            <span className="font-semibold text-white text-base">
              {session.duration ?? 0}m
            </span>
          </div>

          <div className="w-px h-10 bg-white/10 hidden md:block"></div>

          <div className="flex flex-col gap-2 min-w-[120px]">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold gap-2">
              <span className="flex items-center gap-1.5">
                <Activity size={14} /> Progress
              </span>
              <span className="text-white">{session.progress ?? 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5BE584] rounded-full transition-all duration-500"
                style={{ width: `${session.progress ?? 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
