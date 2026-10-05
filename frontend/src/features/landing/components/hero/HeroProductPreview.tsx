// src/features/landing/components/hero/HeroProductPreview.tsx
import React from "react";
import { Activity, Users, ClipboardList } from "lucide-react";

export const HeroProductPreview: React.FC = () => {
  return (
    <div className="relative w-full h-[400px] lg:h-[500px] perspective-1000 animate-[float_8s_ease-in-out_infinite]">
      {/* Glow behind the preview */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#5BE584]/5 to-transparent rounded-2xl border border-[#1e2329]/50 shadow-[0_0_80px_rgba(91,229,132,0.05)] transform lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0 flex items-center justify-center overflow-hidden bg-[#0D1014]">
        {/* Fake Window Header */}
        <div className="absolute top-0 left-0 w-full flex h-10 items-center gap-2 border-b border-[#1E2329] bg-[#090B0F] px-4 z-30">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#1E2329]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#1E2329]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#1E2329]" />
          </div>
          <div className="mx-auto flex h-5 items-center rounded bg-[#1E2329] px-4 text-[10px] font-mono text-gray-500">
            stren.os / coach-dashboard
          </div>
        </div>

        {/* Center Node representing the core platform */}
        <div className="relative z-20 h-24 w-24 rounded-full border border-[#5BE584]/30 bg-[#16291d]/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(91,229,132,0.2)]">
          <Activity className="h-10 w-10 text-[#5BE584]" />
        </div>

        {/* Orbiting Elements showing real platform features */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-[float_8s_ease-in-out_2s_infinite]">
          <div className="flex items-center gap-3 bg-[#090B0F]/90 backdrop-blur-md border border-[#1e2329] p-3 rounded-xl shadow-xl">
            <div className="h-8 w-8 rounded-lg bg-[#16291d] text-[#5BE584] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Members
              </span>
              <span className="text-xs font-medium text-gray-200">
                Active Roster
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/4 translate-y-1/4 animate-[float_8s_ease-in-out_4s_infinite]">
          <div className="flex items-center gap-3 bg-[#090B0F]/90 backdrop-blur-md border border-[#1e2329] p-3 rounded-xl shadow-xl">
            <div className="h-8 w-8 rounded-lg bg-[#16291d] text-[#5BE584] flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Assignments
              </span>
              <span className="text-xs font-medium text-gray-200">
                Periodized Blocks
              </span>
            </div>
          </div>
        </div>

        {/* Technical grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      </div>
    </div>
  );
};
