import { Link } from "react-router-dom";
import {
  Dumbbell,
  Flame,
  Target,
  Activity,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";

export const QuickLinks = () => {
  const links = [
    { name: "Exercises", icon: Dumbbell, path: "/exercises" },
    { name: "Workouts", icon: Flame, path: "/workouts" },
    { name: "Assignments", icon: Target, path: "/assignments" },
    { name: "Sessions", icon: Activity, path: "/sessions" },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="w-5 h-5 text-[#5BE584]" />
        <h2 className="text-xl font-semibold text-white">Quick Links</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="group bg-[#11151B] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-[#5BE584]/20 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#5BE584]/10 transition-colors">
                <link.icon className="w-6 h-6 text-zinc-400 group-hover:text-[#5BE584] transition-colors" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">
              {link.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
