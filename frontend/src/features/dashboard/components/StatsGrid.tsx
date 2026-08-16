import { CheckCircle2, Activity, Flame, Target } from "lucide-react";
import type { MemberDashboard } from "../types/dashboard.types"; // عدل المسار إذا لزم الأمر

interface StatsGridProps {
  dashboard: MemberDashboard | undefined;
}

export const StatsGrid = ({ dashboard }: StatsGridProps) => {
  const stats = [
    {
      label: "Completed Sessions",
      value: dashboard?.completedSessions || 0,
      icon: CheckCircle2,
    },
    {
      label: "Total Sessions",
      value: dashboard?.totalSessions || 0,
      icon: Activity,
    },
    {
      label: "Recent Logs",
      value: dashboard?.recentLogs?.length || 0,
      icon: Flame,
    },
    {
      label: "Assignment Status",
      value: dashboard?.activeAssignment?.status || "None",
      icon: Target,
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#11151B] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-[#5BE584]/20 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
            <stat.icon className="w-5 h-5 text-[#5BE584]" />
          </div>
          <p className="text-zinc-500 font-medium text-sm mb-1">{stat.label}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight capitalize">
            {stat.value}
          </h3>
        </div>
      ))}
    </section>
  );
};
