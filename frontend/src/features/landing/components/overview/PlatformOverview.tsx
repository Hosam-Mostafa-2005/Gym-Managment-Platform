// src/features/landing/components/overview/PlatformOverview.tsx
import React from "react";
import {
  Users,
  ClipboardList,
  Dumbbell,
  Activity,
  Ruler,
  LineChart,
  LayoutDashboard,
  Bell,
} from "lucide-react";
import { PlatformModuleCard } from "./PlatformModuleCard";

export const PlatformOverview: React.FC = () => {
  // Utilizing actual product features based on the application's capabilities
  const modules = [
    {
      title: "Coach Dashboard",
      description: "Centralized command center for operations.",
      icon: LayoutDashboard,
    },
    {
      title: "Members Management",
      description: "Complete oversight of your active roster.",
      icon: Users,
    },
    {
      title: "Assignments",
      description: "Allocate training blocks and periodized plans.",
      icon: ClipboardList,
    },
    {
      title: "Workouts",
      description: "Build and program structured routines.",
      icon: Dumbbell,
    },
    {
      title: "Workout Sessions",
      description: "Track execution and athletic performance.",
      icon: Activity,
    },
    {
      title: "Body Measurements",
      description: "Log physiological baselines and metrics.",
      icon: Ruler,
    },
    {
      title: "Member Insights",
      description: "Analyze training adherence and progress.",
      icon: LineChart,
    },
    {
      title: "Notifications",
      description: "Real-time updates on athlete activity.",
      icon: Bell,
    },
  ];

  return (
    <section
      id="platform"
      className="border-b border-[#1E2329] bg-[#0A0C10] py-24 px-6 relative"
    >
      {/* Subtle background glow for the section */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_right,_rgba(91,229,132,0.03)_0%,_rgba(9,11,15,0)_70%)] pointer-events-none blur-3xl" />

      <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-16 relative z-10">
        <div className="text-center flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5BE584] border border-[#5BE584]/20 bg-[#5BE584]/10 px-3 py-1 rounded-full mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            A comprehensive coaching ecosystem.
          </h2>
          <p className="max-w-2xl text-base text-gray-400">
            Purpose-built modules designed to handle everything from initial
            member onboarding to advanced periodization tracking.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, idx) => (
            <PlatformModuleCard
              key={idx}
              title={mod.title}
              description={mod.description}
              icon={mod.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
