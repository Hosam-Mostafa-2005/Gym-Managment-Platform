import React from "react";
import { Flame, Dumbbell } from "lucide-react";
import type { RecentWorkoutLog } from "../types/dashboard.types"; // عدل المسار إذا لزم الأمر

interface RecentLogsCardProps {
  logs: RecentWorkoutLog[] | undefined;
}

export const RecentLogsCard = ({ logs }: RecentLogsCardProps) => {
  return (
    <section className="bg-[#11151B] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-[#5BE584]/20 hover:-translate-y-1 mb-10">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-5 h-5 text-[#5BE584]" />
        <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
      </div>

      {logs && logs.length > 0 ? (
        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="py-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#5BE584]/10 group-hover:text-[#5BE584] transition-colors">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-base">
                    {log.exercise?.name || "Unknown Exercise"}
                  </h4>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {new Date(log.performedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-[#5BE584]">
                  {log.weight} kg
                </span>
                <span className="text-xs font-medium text-zinc-400 mt-0.5">
                  {log.reps} Reps
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center flex flex-col items-center">
          <Dumbbell className="w-10 h-10 text-zinc-700 mb-3" />
          <p className="text-zinc-400">No recent logs recorded yet.</p>
        </div>
      )}
    </section>
  );
};
