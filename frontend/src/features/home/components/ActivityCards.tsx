import React from "react";
import { CheckCircle2, Activity, Target, Flame } from "lucide-react";

export const ActivityCards = ({
  stats,
  assignmentsCount,
}: {
  stats: any;
  assignmentsCount: number;
}) => {
  const cards = [
    {
      label: "Completed Sessions",
      value: stats?.completedSessions || 0,
      icon: CheckCircle2,
    },
    {
      label: "Total Sessions",
      value: stats?.totalSessions || 0,
      icon: Activity,
    },
    { label: "Active Assignments", value: assignmentsCount || 0, icon: Target },
    {
      label: "Recent Logs",
      value: stats?.recentLogs?.length || 0,
      icon: Flame,
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-[#11151B] border border-white/5 rounded-2xl p-8 hover:-translate-y-1 hover:border-white/10 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <card.icon className="w-7 h-7 text-[#5BE584]" />
          </div>
          <p className="text-zinc-400 font-medium text-base mb-3">
            {card.label}
          </p>
          <h3 className="text-4xl font-bold text-white tracking-tight">
            {card.value}
          </h3>
        </div>
      ))}
    </section>
  );
};
