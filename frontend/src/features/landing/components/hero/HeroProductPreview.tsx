// src/features/landing/components/hero/HeroProductPreview.tsx
import React from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Ruler,
  Users,
} from "lucide-react";

export const HeroProductPreview: React.FC = () => {
  const sampleExercises = [
    {
      name: "Barbell Back Squat",
      prescription: "4 sets × 6 reps · 120s rest",
      status: "Completed",
      done: true,
    },
    {
      name: "Romanian Deadlift",
      prescription: "3 sets × 8 reps · 90s rest",
      status: "Completed",
      done: true,
    },
    {
      name: "Bulgarian Split Squat",
      prescription: "3 sets × 10 reps · 60s rest",
      status: "In Progress",
      done: false,
    },
  ];

  return (
    <div className="relative w-full rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_36px_rgba(91,229,132,0.07)] overflow-hidden">
      {/* Top specular highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#5BE584]/55 to-transparent"
      />

      {/* Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3039] bg-[#090B0F]/90 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-[#5BE584]/30 bg-[#5BE584]/15 text-[#5BE584]">
            <Dumbbell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#F8FAFC]">
              Strength Block A — Lower Body
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              Assigned by Coach · Active Session
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/35 bg-[#5BE584]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#5BE584] shadow-[0_0_16px_rgba(91,229,132,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] shadow-[0_0_6px_#5BE584]" />
          Live Tracking
        </span>
      </div>

      {/* Main Preview Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Top Metrics Strip */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#94A3B8]">
              <Users className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Roster</span>
            </div>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#F8FAFC]">
              24 Athletes
            </p>
          </div>
          <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#94A3B8]">
              <ClipboardList className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Assigned</span>
            </div>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#F8FAFC]">
              18 Active
            </p>
          </div>
          <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#94A3B8]">
              <Activity className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Completion</span>
            </div>
            <p className="mt-1 text-base sm:text-lg font-bold text-[#5BE584]">
              92%
            </p>
          </div>
        </div>

        {/* Structured Exercise Execution List */}
        <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#2A3039] pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Programmed Exercises
            </span>
            <span className="text-xs font-medium text-[#94A3B8]">
              10 Sets Total
            </span>
          </div>

          <div className="space-y-2">
            {sampleExercises.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[#2A3039] bg-[#13171D] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {item.prescription}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    item.done
                      ? "border border-[#22C55E]/30 bg-[#22C55E]/15 text-[#22C55E]"
                      : "border border-[#F59E0B]/30 bg-[#F59E0B]/15 text-[#F59E0B]"
                  }`}
                >
                  {item.done && <CheckCircle2 className="h-3 w-3" />}
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Body Measurements & Sync Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[#2A3039] bg-[#1B2028]/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-xs text-[#F8FAFC]">
            <Ruler className="h-4 w-4 text-[#5BE584]" />
            <span>Body Measurements & Session Logs Synced</span>
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8]">
            Real-time Socket.IO
          </span>
        </div>
      </div>
    </div>
  );
};
