// src/features/landing/components/features/FeaturesInContext.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Clock,
  Dumbbell,
  LineChart,
  RefreshCw,
  Ruler,
  Sparkles,
} from "lucide-react";

export const FeaturesInContext: React.FC = () => {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0C1016_50%,#090B0F_100%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-24 h-[420px] w-[500px] rounded-full bg-[#5BE584]/[0.05] blur-[150px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Core Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12] mb-4">
            Engineered for serious strength training.
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            Every module in STREN was built to solve authentic coaching and athletic execution challenges—with
            concrete target prescriptions, previous performance memory, and live telemetry.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Prescription Targets (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 h-40 w-40 bg-[#5BE584]/[0.08] blur-[70px]"
            />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5BE584] rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-2.5 py-0.5">
                  Coach Prescription
                </span>
                <span className="text-xs text-[#94A3B8]">Workout Builder Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
                Target Weight & RPE Prescription
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed max-w-xl">
                Coaches do not merely list exercises—they define exact prescribed loads (kg), target RPE
                intensity ratings (1–10), and strict rest periods for every exercise in the template.
              </p>
            </div>

            {/* Visual Interface Preview */}
            <div className="rounded-[16px] border border-[#2A3039] bg-[#090B0F] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#2A3039]/60">
                <span className="font-semibold text-[#F8FAFC]">Barbell Back Squat · Working Sets</span>
                <span className="text-[#5BE584]">Target Targets Active</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3">
                  <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
                    Prescribed Target Load
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#F8FAFC]">140 kg</p>
                  <p className="text-[10px] text-[#22C55E] mt-0.5">+5 kg from last mesocycle</p>
                </div>
                <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3">
                  <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
                    Prescribed Target RPE
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#5BE584]">8.5 / 10</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">~1-2 Reps in Reserve</p>
                </div>
                <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3">
                  <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
                    Rest Interval
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#F8FAFC]">180 Seconds</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">Automated timer sync</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2A3039]/60 text-xs">
              <span className="text-[#94A3B8]">Available in Workout Builder & Assignments</span>
              <Link
                to="/workout-builder/all"
                className="inline-flex items-center gap-1 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors"
              >
                Open Workout Builder <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: In-Session Exercise Swapping */}
          <div className="rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8] rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-2.5 py-0.5">
                  Live Flexibility
                </span>
                <RefreshCw className="h-4 w-4 text-[#38BDF8]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                In-Session Exercise Swapping
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
                Equipment taken or experiencing joint pain? Members can swap to an alternative
                exercise on the fly, with reason logging preserved for the coach.
              </p>
            </div>

            {/* Visual Swap Modal Snippet */}
            <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 space-y-2.5 text-xs">
              <div className="text-[11px] font-semibold text-[#94A3B8]">Active Swap Event</div>
              <div className="flex items-center justify-between rounded-[8px] bg-[#161B22] p-2.5 border border-[#222832]">
                <div>
                  <p className="font-bold text-[#F8FAFC]">Flat Barbell Bench</p>
                  <p className="text-[10px] text-[#EF4444]">Replaced · Equipment in use</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
                <div className="text-right">
                  <p className="font-bold text-[#5BE584]">Incline DB Press</p>
                  <p className="text-[10px] text-[#22C55E]">New Active Target</p>
                </div>
              </div>
              <div className="text-[10px] text-[#94A3B8] italic">
                Logged to Coach: &quot;Bench press was occupied by 3 lifters; swapped to dumbbells.&quot;
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A3039]/60 text-xs text-[#94A3B8]">
              Preserves exercise history & volume totals
            </div>
          </div>

          {/* Bento Card 3: Previous Performance Benchmark Memory */}
          <div className="rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#22C55E] rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 px-2.5 py-0.5">
                  Overload Memory
                </span>
                <Clock className="h-4 w-4 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                Previous Performance Memory
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
                During active training, STREN surfaces what you performed in the previous session
                so you never wonder what weights to rack.
              </p>
            </div>

            {/* Visual Benchmark Pill */}
            <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 space-y-2 text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Bench Press · Set 3 Memory
              </span>
              <div className="flex items-center justify-between rounded-[8px] bg-[#141A22] p-2.5 border border-[#222832]">
                <span className="text-[#94A3B8]">Previous Session:</span>
                <span className="font-mono font-bold text-[#22C55E]">100 kg × 6 reps</span>
              </div>
              <div className="flex items-center justify-between rounded-[8px] bg-[#5BE584]/10 p-2.5 border border-[#5BE584]/30">
                <span className="text-[#F8FAFC] font-semibold">Today&apos;s Target:</span>
                <span className="font-mono font-bold text-[#5BE584]">102.5 kg × 6 reps</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A3039]/60 text-xs text-[#94A3B8]">
              Automated progressive overload tracking
            </div>
          </div>

          {/* Bento Card 4: Physical Body Metrics & Circumferences (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A78BFA] rounded-full bg-[#A78BFA]/15 border border-[#A78BFA]/30 px-2.5 py-0.5">
                  Body Composition
                </span>
                <Ruler className="h-4 w-4 text-[#A78BFA]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
                Body Measurements & Physical Progress
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed max-w-xl">
                Log body weight, estimated body fat percentage, and anatomical circumferences
                (chest, waist, hips, arms, thighs). Correlate physical adaptations with training volume.
              </p>
            </div>

            {/* Visual Measurement Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">Body Weight</span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">78.4 kg</p>
                <span className="text-[10px] text-[#22C55E]">-1.8 kg</span>
              </div>
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">Body Fat %</span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">14.2%</p>
                <span className="text-[10px] text-[#22C55E]">-1.1%</span>
              </div>
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">Chest Circumference</span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">104 cm</p>
                <span className="text-[10px] text-[#5BE584]">+2.5 cm</span>
              </div>
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">Waist Circumference</span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">79 cm</p>
                <span className="text-[10px] text-[#22C55E]">-3.0 cm</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2A3039]/60 text-xs">
              <span className="text-[#94A3B8]">Full historical log with delta tracking</span>
              <Link
                to="/measurements"
                className="inline-flex items-center gap-1 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors"
              >
                View Body Measurements <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Supporting Feature Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-[18px] border border-[#2A3039] bg-[#0F131A] p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">Categorized Exercise Taxonomy</h4>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                Filter hundreds of compound and isolation movements by target muscles and equipment in our exercise database.
              </p>
              <Link
                to="/workout-library/exercises"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] hover:underline"
              >
                Browse Exercises <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#2A3039] bg-[#0F131A] p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">Real-Time Socket.IO Alerts</h4>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                Instant alerts notify athletes of new assignments and alert coaches when a member completes a training session.
              </p>
              <Link
                to="/notifications"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] hover:underline"
              >
                Notification Feed <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#2A3039] bg-[#0F131A] p-5 flex items-start gap-4 sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">Total Volume & Tonnage Logs</h4>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                Every verified repetition compiles automatically into total lifted kg, surfacing true training density and progressive overload.
              </p>
              <Link
                to="/sessions"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] hover:underline"
              >
                Session History <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
