import { Clock, User, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WorkoutSession } from "../types/workout-session.types";

interface WorkoutHeaderProps {
  session: WorkoutSession;
}

export default function WorkoutHeader({ session }: WorkoutHeaderProps) {
  const { t } = useTranslation(["workoutSessions", "common"]);

  const workoutTitle =
    session.workout?.title ||
    session.assignment?.workout?.title ||
    t("overview.workoutSessionDefault", "Workout Session");

  const trainerName = session.assignment?.trainer?.name;

  return (
    <header className="bg-[#11151B] border border-white/5 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {workoutTitle}
          </h1>
          <div className="flex items-center gap-2 mt-3 text-sm text-[#9CA3AF]">
            <User size={16} className="text-white/40" />
            <span>
              {trainerName
                ? t("overview.coachPrefix", {
                    name: trainerName,
                    defaultValue: `Coach ${trainerName}`,
                  })
                : t("activeWorkout.personalTraining", "Personal Training")}
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-6 bg-[#090B0F] p-4 rounded-xl border border-white/5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold">
              {t("overview.tableStatus", "Status")}
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#5BE584] ltr:mr-2 rtl:ml-2 animate-pulse"></span>
              )}
              {session.status === "IN_PROGRESS"
                ? t("overview.inProgress", "In Progress")
                : session.status === "COMPLETED"
                  ? t("overview.statusCompleted", "Completed")
                  : session.status}
            </span>
          </div>

          <div className="w-px h-10 bg-white/10 hidden md:block"></div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Clock size={14} /> {t("activeWorkout.duration", "Duration")}
            </span>
            <span className="font-semibold text-white text-base font-mono">
              {session.duration ?? 0}m
            </span>
          </div>

          <div className="w-px h-10 bg-white/10 hidden md:block"></div>

          <div className="flex flex-col gap-2 min-w-[120px]">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold gap-2">
              <span className="flex items-center gap-1.5">
                <Activity size={14} /> {t("activeWorkout.progress", "Progress")}
              </span>
              <span className="text-white font-mono">{session.progress ?? 0}%</span>
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
