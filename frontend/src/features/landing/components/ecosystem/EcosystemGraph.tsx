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
      pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    },
    {
      icon: Dumbbell,
      label: "Workouts",
      pos: "top-1/4 right-0 translate-x-1/2 -translate-y-1/2",
    },
    {
      icon: Activity,
      label: "Sessions",
      pos: "bottom-1/4 right-0 translate-x-1/2 translate-y-1/2",
    },
    {
      icon: Ruler,
      label: "Metrics",
      pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    },
    {
      icon: LineChart,
      label: "Insights",
      pos: "bottom-1/4 left-0 -translate-x-1/2 translate-y-1/2",
    },
    {
      icon: Bell,
      label: "Events",
      pos: "top-1/4 left-0 -translate-x-1/2 -translate-y-1/2",
    },
  ];

  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto mt-20">
      {/* Circular Grid Background */}
      <div className="absolute inset-0 rounded-full border border-[#1E2329] opacity-20" />
      <div className="absolute inset-10 rounded-full border border-[#1E2329] opacity-40" />
      <div className="absolute inset-24 rounded-full border border-[#1E2329] opacity-60" />

      {/* Central Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[#5BE584] bg-[#0D1117] shadow-[0_0_60px_rgba(91,229,132,0.2)] animate-pulse-glow">
        <Share2 className="h-8 w-8 text-[#5BE584] mb-1" />
        <span className="text-[9px] font-bold tracking-widest text-white">
          PLATFORM
        </span>
      </div>

      {/* Connecting Lines SVG */}
      <svg
        className="absolute inset-0 w-full h-full -z-10 opacity-30"
        viewBox="0 0 100 100"
      >
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="0"
          stroke="#5BE584"
          strokeWidth="0.5"
          className="animate-draw-line"
        />
        <line
          x1="50"
          y1="50"
          x2="100"
          y2="25"
          stroke="#5BE584"
          strokeWidth="0.5"
          className="animate-draw-line"
        />
        <line
          x1="50"
          y1="50"
          x2="100"
          y2="75"
          stroke="#5BE584"
          strokeWidth="0.5"
          className="animate-draw-line"
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="100"
          stroke="#5BE584"
          strokeWidth="0.5"
          className="animate-draw-line"
        />
        <line
          x1="50"
          y1="50"
          x2="0"
          y2="75"
          stroke="#5BE584"
          strokeWidth="0.5"
          className="animate-draw-line"
        />
        <line
          x1="50"
          y1="50"
          x2="0"
          y2="25"
          stroke="#5BE584"
          strokeWidth="0.5"
          className="animate-draw-line"
        />
      </svg>

      {/* Peripheral Nodes */}
      {nodes.map((node, i) => (
        <div
          key={i}
          className={`absolute ${node.pos} flex flex-col items-center gap-2 bg-[#090B0F] p-2 z-10`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#1E2329] bg-[#0D1117] text-gray-400 transition-colors hover:border-[#5BE584] hover:text-[#5BE584]">
            <node.icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            {node.label}
          </span>
        </div>
      ))}
    </div>
  );
};
