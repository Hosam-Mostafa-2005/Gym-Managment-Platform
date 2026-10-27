// src/features/landing/components/comparison/DualPerspectiveSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Repeat,
  UserCheck,
  Zap,
} from "lucide-react";

export const DualPerspectiveSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      {/* Center ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[600px] rounded-full bg-[#5BE584]/[0.05] blur-[150px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-3">
            <Repeat className="h-3.5 w-3.5" />
            Two Roles · One Ecosystem
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12] mb-4">
            Designed for both sides of the barbell.
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            Coaches need deep programming controls and roster oversight. Athletes need a clean,
            low-friction session tracker that works on gym floor mobile. STREN provides tailored
            interfaces backed by a unified training graph.
          </p>
        </div>

        {/* Side-by-Side Dual Perspective Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-stretch">
          {/* Coach Perspective Card */}
          <div className="lg:col-span-5 rounded-[22px] border border-[#2A3039] bg-gradient-to-b from-[#141A22] to-[#0F1319] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#2A3039]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/35 text-[#5BE584]">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5BE584]">
                      Coaching Side
                    </span>
                    <h3 className="text-lg font-bold text-[#F8FAFC]">
                      The Coach Workspace
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-mono text-[#94A3B8]">
                  /coach-dashboard
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Empowers coaches to build reusable programs, specify exact target intensities,
                and monitor member training compliance without manual follow-up.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "Workout Builder with Prescription Targets",
                    desc: "Define exact target kg loads and target RPE for every movement.",
                  },
                  {
                    title: "Member Roster Management",
                    desc: "Track client adherence rates and manage assigned training splits.",
                  },
                  {
                    title: "Program Assignment Distribution",
                    desc: "Push structured workout blocks to individual athletes with scheduled dates.",
                  },
                  {
                    title: "Session Review & Feedback Telemetry",
                    desc: "Inspect verified set tonnage, completed sets, and member RPE submissions.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-[12px] border border-[#222832] bg-[#090B0F]/80 p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5BE584] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#F8FAFC]">{item.title}</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/coach-dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#5BE584] px-5 py-2.5 text-xs font-semibold text-[#090B0F] shadow-[0_0_16px_rgba(91,229,132,0.22)] transition-all hover:bg-[#49D472]"
            >
              Explore Coach Workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Central Live Sync Connector */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center py-4 lg:py-0">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#141A22] border border-[#5BE584]/40 flex items-center justify-center text-[#5BE584] shadow-[0_0_24px_rgba(91,229,132,0.2)]">
                <Zap className="h-5 w-5" />
              </div>
              <div className="hidden lg:flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5BE584] text-center">
                  Live
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8] text-center">
                  Socket.IO
                </span>
              </div>
            </div>
          </div>

          {/* Member Perspective Card */}
          <div className="lg:col-span-5 rounded-[22px] border border-[#2A3039] bg-gradient-to-b from-[#141A22] to-[#0F1319] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#2A3039]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/35 text-[#5BE584]">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5BE584]">
                      Athlete Side
                    </span>
                    <h3 className="text-lg font-bold text-[#F8FAFC]">
                      The Member Workspace
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-mono text-[#94A3B8]">
                  /dashboard
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Empowers athletes with zero-friction live logging, previous performance benchmarks,
                and on-the-fly exercise swapping when gym equipment is busy.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "Assigned Workout Access",
                    desc: "Open scheduled routines with clear coach notes and prescribed set targets.",
                  },
                  {
                    title: "Live Set & Rep Logging",
                    desc: "Quick one-tap completion with automated rest countdown timer.",
                  },
                  {
                    title: "Previous Performance Memory",
                    desc: "Surfaces last week's verified weight and reps right beside current inputs.",
                  },
                  {
                    title: "In-Session Exercise Swapping",
                    desc: "Swap occupied equipment during active training with automatic reason logging.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-[12px] border border-[#222832] bg-[#090B0F]/80 p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5BE584] mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#F8FAFC]">{item.title}</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#2A3039] bg-[#090B0F] px-5 py-2.5 text-xs font-semibold text-[#F8FAFC] transition-all hover:border-[#38414D] hover:bg-[#13171D]"
            >
              Explore Member Workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
