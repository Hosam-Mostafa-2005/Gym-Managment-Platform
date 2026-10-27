// src/features/landing/components/overview/PlatformOverview.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  Dumbbell,
  Repeat,
  UserCheck,
  Flame,
  Activity,
  History,
} from "lucide-react";

export const PlatformOverview: React.FC = () => {
  return (
    <section
      id="platform"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0C1017_50%,#090B0F_100%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient center illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[340px] w-[680px] rounded-full bg-[#5BE584]/[0.05] blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-4">
            <Repeat className="h-3.5 w-3.5" />
            The Closed Coaching Loop
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] mb-4 leading-[1.12]">
            How STREN unites coaching intention and athlete execution.
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            Traditional coaching relies on detached PDFs, scattered chats, and forgotten notebooks.
            STREN creates a continuous, two-way pipeline where every workout prescription flows
            seamlessly into a live guided workout and returns verified performance telemetry to the coach.
          </p>
        </div>

        {/* Central Closed-Loop Architecture Workbench */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] via-[#12161D] to-[#0D1015] p-6 sm:p-8 lg:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_36px_rgba(91,229,132,0.04)]">
          {/* Top specular hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/50 to-transparent"
          />

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 lg:gap-8 items-center">
            {/* Left Block: The Coach Prescription Engine */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
                      Role 1 · Prescription
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC]">
                      The Coach Command Center
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-medium text-[#94A3B8]">
                  Programming
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Coaches design structured workout templates with target weights, target RPE, and rest
                timers, then assign them directly to athlete rosters.
              </p>

              {/* Coach Mini-Card Preview */}
              <div className="rounded-[16px] border border-[#2A3039] bg-[#090B0F]/90 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A3039]/60">
                  <span className="font-semibold text-[#F8FAFC]">Hypertrophy Upper A</span>
                  <span className="text-[#5BE584] font-medium">Assigned to 4 Athletes</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="text-[#F8FAFC] font-medium">Barbell Bench Press</span>
                    <span className="text-[#94A3B8]">4 sets · Target 80 kg · RPE 8</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="text-[#F8FAFC] font-medium">Incline Dumbbell Row</span>
                    <span className="text-[#94A3B8]">3 sets · Target 32 kg · 90s Rest</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Pipeline: Bidirectional Synchronization */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 lg:py-0">
              <div className="flex flex-col items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-[#5BE584]/15 border border-[#5BE584]/40 flex items-center justify-center text-[#5BE584] shadow-[0_0_20px_rgba(91,229,132,0.25)]">
                  <Repeat className="h-4 w-4 animate-spin [animation-duration:12s]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5BE584] text-center hidden lg:block">
                  Live Sync
                </span>
              </div>
            </div>

            {/* Right Block: The Member Training Logger */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
                      Role 2 · Execution
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC]">
                      The Member Active Session
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-medium text-[#5BE584]">
                  In Session
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Members launch today's scheduled workout, view previous lift benchmarks, check off
                completed sets, swap occupied equipment, and submit perceived exertion.
              </p>

              {/* Member Mini-Card Preview */}
              <div className="rounded-[16px] border border-[#2A3039] bg-[#090B0F]/90 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A3039]/60">
                  <span className="font-semibold text-[#F8FAFC]">Bench Press · Set 2 of 4</span>
                  <span className="text-xs text-[#22C55E] font-medium">Prev: 80 kg × 8</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="block text-[#94A3B8] text-[9px] uppercase">Weight</span>
                    <span className="font-bold text-[#F8FAFC]">82.5 kg</span>
                  </div>
                  <div className="bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="block text-[#94A3B8] text-[9px] uppercase">Reps</span>
                    <span className="font-bold text-[#F8FAFC]">8 reps</span>
                  </div>
                  <div className="bg-[#5BE584]/15 p-2 rounded-[8px] border border-[#5BE584]/35 text-[#5BE584]">
                    <span className="block text-[9px] uppercase font-semibold">Status</span>
                    <span className="font-bold">Logged ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Return Banner */}
          <div className="mt-8 pt-6 border-t border-[#2A3039] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/30">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <p className="text-xs sm:text-sm text-[#A7B0BC]">
                <strong className="text-[#F8FAFC]">Automated Feedback Loop:</strong> Session
                tonnage (kg), completion rate, and logged RPE automatically sync back to the Coach
                Dashboard upon completion.
              </p>
            </div>
            <Link
              to="/workout-library/exercises"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors whitespace-nowrap"
            >
              Explore Exercise Taxonomy <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Core Structural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-[20px] border border-[#2A3039] bg-[#12161D] p-6 flex flex-col gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Prescription Targets & RPE
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Coaches do not just name movements—they specify exact target weights and target RPE thresholds.
              Athletes know the exact intensity intended for every single set.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#2A3039] bg-[#12161D] p-6 flex flex-col gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <History className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Previous Performance Memory
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              During active training, STREN surfaces the member's last verified weight and reps directly
              in the input row. Progressive overload is structured, not remembered.
            </p>
          </div>

          <div className="rounded-[20px] border border-[#2A3039] bg-[#12161D] p-6 flex flex-col gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Instant Tonnage & Telemetry
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              No manual spreadsheets or check-in text messages. Completed sessions instantly calculate
              total volume, log session duration, and update adherence stats for coach review.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
