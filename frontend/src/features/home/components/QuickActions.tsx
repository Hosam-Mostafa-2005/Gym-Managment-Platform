import React from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Flame,
  Target,
  LayoutDashboard,
  History,
} from "lucide-react";

export const QuickActions = () => {
  const actions = [
    { name: "Exercises", icon: Dumbbell, path: "/exercises" },
    { name: "Workouts", icon: Flame, path: "/workouts" },
    { name: "Assignments", icon: Target, path: "/assignments" },
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "History", icon: History, path: "/sessions/history" },
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold text-white tracking-tight mb-10">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.path}
            className="bg-[#11151B] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-5 hover:-translate-y-1 hover:border-[#5BE584]/20 transition-all duration-300 group"
          >
            <div className="bg-white/5 p-5 rounded-2xl group-hover:bg-[#5BE584]/10 transition-colors">
              <action.icon className="w-7 h-7 text-zinc-400 group-hover:text-[#5BE584]" />
            </div>
            <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors text-lg">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
