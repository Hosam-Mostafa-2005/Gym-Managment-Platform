// src/features/landing/components/how-it-works/HowItWorksSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  Dumbbell,
  History,
  LineChart,
  Repeat,
  Trophy,
} from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState(3);

  const stages = [
    {
      num: 1,
      actor: "Coach",
      actorBadge: "Coach Action",
      actorColor: "text-[#5BE584] bg-[#5BE584]/15 border-[#5BE584]/35",
      title: "Prescription & Template Creation",
      description:
        "Coach selects compound movements, establishes exercise sequencing, and prescribes target weights, target RPE ratings, and rest intervals in the Workout Builder.",
      route: "/workout-builder/all",
      routeLabel: "Workout Builder",
      icon: Dumbbell,
    },
    {
      num: 2,
      actor: "Coach",
      actorBadge: "Coach Action",
      actorColor: "text-[#5BE584] bg-[#5BE584]/15 border-[#5BE584]/35",
      title: "Athlete Assignment",
      description:
        "Coach assigns the structured workout routine to an active member or group with scheduled training dates, making the routine immediately available.",
      route: "/assignments/all",
      routeLabel: "Assignments",
      icon: ClipboardList,
    },
    {
      num: 3,
      actor: "System",
      actorBadge: "Socket.IO Sync",
      actorColor: "text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/35",
      title: "Instant Notification Alert",
      description:
        "Real-time Socket.IO notification delivers instant alert to the athlete's workspace, prompting them with today's scheduled training program.",
      route: "/notifications",
      routeLabel: "Notifications",
      icon: Bell,
    },
    {
      num: 4,
      actor: "Member",
      actorBadge: "Member Action",
      actorColor: "text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/35",
      title: "Live Guided Execution",
      description:
        "Member starts the workout. STREN displays previous session performance benchmarks, runs rest countdown timers, and allows on-the-fly exercise swaps.",
      route: "/sessions",
      routeLabel: "Active Sessions",
      icon: History,
    },
    {
      num: 5,
      actor: "Member",
      actorBadge: "Member Action",
      actorColor: "text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/35",
      title: "RPE Exertion & Session Finish",
      description:
        "Upon finishing all working sets, the member logs subjective session RPE (1–10) and notes, completing the workout and compiling total volume tonnage.",
      route: "/dashboard",
      routeLabel: "Member Dashboard",
      icon: Trophy,
    },
    {
      num: 6,
      actor: "Coach & Member",
      actorBadge: "Shared Telemetry",
      actorColor: "text-[#A78BFA] bg-[#A78BFA]/15 border-[#A78BFA]/35",
      title: "Performance Review & Feedback",
      description:
        "Completed session stats, volume logs, and RPE ratings instantly update on the Coach Dashboard for progress verification and program progression.",
      route: "/coach-dashboard",
      routeLabel: "Coach Dashboard",
      icon: LineChart,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient background light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[700px] rounded-full bg-[#5BE584]/[0.05] blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-3">
            <Repeat className="h-3.5 w-3.5" />
            End-To-End Training Lifecycle
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12] mb-4">
            From prescription to reflection in six clear stages.
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            See how STREN coordinates programming, delivery, live execution, and telemetry
            between coaches and athletes with zero manual data transfer.
          </p>
        </div>

        {/* Desktop Connected Progression Flow / Mobile Vertical Timeline */}
        <div className="relative">
          {/* Desktop Connecting Line */}
          <div
            aria-hidden="true"
            className="hidden xl:block absolute top-[28px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-[#5BE584]/20 via-[#5BE584]/50 to-[#5BE584]/20 -z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 sm:gap-5 relative z-10">
            {stages.map((stg, idx) => {
              const Icon = stg.icon;
              const isSelected = activeStage === idx;
              return (
                <button
                  key={stg.num}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={`group relative flex flex-col justify-between rounded-[20px] border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-[#5BE584] bg-gradient-to-b from-[#171D25] to-[#12161E] shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(91,229,132,0.12)] -translate-y-1.5"
                      : "border-[#2A3039] bg-[#0E1218] hover:border-[#38414D] hover:bg-[#13171D]"
                  }`}
                >
                  <div>
                    {/* Top Node Indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-[12px] border font-bold text-sm transition-colors ${
                          isSelected
                            ? "border-[#5BE584] bg-[#5BE584] text-[#090B0F] shadow-[0_0_16px_rgba(91,229,132,0.4)]"
                            : "border-[#2A3039] bg-[#161B22] text-[#94A3B8] group-hover:text-[#F8FAFC]"
                        }`}
                      >
                        0{stg.num}
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${stg.actorColor}`}
                      >
                        {stg.actor}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        className={`h-4 w-4 ${
                          isSelected ? "text-[#5BE584]" : "text-[#94A3B8]"
                        }`}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Stage 0{stg.num}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold leading-snug mb-2 ${
                        isSelected ? "text-[#F8FAFC]" : "text-[#D1D5DB]"
                      }`}
                    >
                      {stg.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {stg.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2A3039]/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {stg.routeLabel}
                    </span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        isSelected ? "text-[#5BE584] translate-x-0.5" : "text-[#94A3B8]"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Stage Deep Dive Card */}
        <div className="rounded-[22px] border border-[#2A3039] bg-gradient-to-r from-[#141A22] via-[#11161D] to-[#0E1218] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#5BE584]/15 border border-[#5BE584]/35 text-[#5BE584]">
              {React.createElement(stages[activeStage].icon, { className: "h-6 w-6" })}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
                  Stage 0{stages[activeStage].num} Focus
                </span>
                <span className="text-xs text-[#94A3B8]">·</span>
                <span className="text-xs text-[#A7B0BC]">{stages[activeStage].actorBadge}</span>
              </div>
              <h4 className="text-lg font-bold text-[#F8FAFC]">
                {stages[activeStage].title}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                {stages[activeStage].description}
              </p>
            </div>
          </div>

          <Link
            to={stages[activeStage].route}
            className="inline-flex items-center gap-2 self-start md:self-auto rounded-[12px] bg-[#5BE584] px-5 py-2.5 text-xs font-semibold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.25)] transition-all hover:bg-[#49D472] whitespace-nowrap"
          >
            Open {stages[activeStage].routeLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
