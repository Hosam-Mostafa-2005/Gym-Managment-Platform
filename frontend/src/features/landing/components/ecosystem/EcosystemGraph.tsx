// src/features/landing/components/ecosystem/EcosystemGraph.tsx
import React from "react";
import {
  Share2,
  Users,
  Dumbbell,
  Activity,
  Ruler,
  LineChart,
  Bell,
} from "lucide-react";

export const EcosystemGraph = () => {
  const nodes = [
    {
      icon: Users,
      label: "Members",
      detail: "Coach-member assignments & profiles",
    },
    {
      icon: Dumbbell,
      label: "Workouts",
      detail: "Exercises, sets, reps & rest intervals",
    },
    {
      icon: Activity,
      label: "Sessions",
      detail: "Live workout execution & volume",
    },
    {
      icon: Ruler,
      label: "Metrics",
      detail: "Weight, body fat & circumference logs",
    },
    {
      icon: LineChart,
      label: "Insights",
      detail: "Adherence rates & training history",
    },
    {
      icon: Bell,
      label: "Events",
      detail: "Real-time Socket.IO notifications",
    },
  ];

  return (
    <div className="relative mt-12 w-full overflow-hidden rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-6 sm:p-8 shadow-[0_18px_48px_rgba(0,0,0,0.45),0_0_32px_rgba(91,229,132,0.05)]">
      {/* Top specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/50 to-transparent"
      />

      {/* Central Hub Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2A3039] pb-6 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[#5BE584]/35 bg-[#5BE584]/15 text-[#5BE584] shadow-[0_0_24px_rgba(91,229,132,0.2)]">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
              STREN Core Data Graph
            </span>
            <h3 className="text-lg font-bold text-[#F8FAFC]">
              Every Coaching Action Updates the Member Experience
            </h3>
          </div>
        </div>
        <span className="rounded-full border border-[#2A3039] bg-[#090B0F] px-3.5 py-1.5 text-xs font-medium text-[#94A3B8]">
          6 Synchronized Domain Modules
        </span>
      </div>

      {/* Connected Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node, i) => (
          <div
            key={i}
            className="group flex items-start gap-3.5 rounded-[14px] border border-[#2A3039] bg-[#090B0F]/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5BE584]/35 hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.6),0_0_20px_rgba(91,229,132,0.06)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] text-[#5BE584] transition-colors group-hover:border-[#5BE584]/40 group-hover:bg-[#5BE584]/10">
              <node.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F8FAFC] transition-colors group-hover:text-[#5BE584]">
                {node.label}
              </h4>
              <p className="mt-0.5 text-xs text-[#94A3B8] leading-relaxed">
                {node.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

