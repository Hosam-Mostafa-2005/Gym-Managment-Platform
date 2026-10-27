// src/features/landing/components/coaches/CoachExperienceSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Dumbbell,
  ClipboardList,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Shield,
} from "lucide-react";

export const CoachExperienceSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const coachFeatures = [
    {
      title: "Active Member Roster",
      tag: "Roster Management",
      route: "/members/all",
      routeLabel: "View Members",
      icon: Users,
      description:
        "Maintain direct coach-member connections. Inspect athlete adherence rates, active training programs, and recent session logs.",
      highlights: [
        "Track adherence rates & last session dates",
        "Direct link to athlete body measurements & history",
        "Role-scoped member isolation",
      ],
    },
    {
      title: "Workout Builder & Target Prescription",
      tag: "Programming Engine",
      route: "/workout-builder/all",
      routeLabel: "Open Workout Builder",
      icon: Sliders,
      description:
        "Build modular training routines with exercise sequencing, prescribed target loads, target RPE ratings, and strict rest timers.",
      highlights: [
        "Prescribe exact target kg and target RPE per exercise",
        "Configure rest timers from 30s to 300s",
        "Organize exercises into reusable split templates",
      ],
    },
    {
      title: "Exercise Library & Taxonomy",
      tag: "Movement Database",
      route: "/workout-library/exercises",
      routeLabel: "Browse Exercise Library",
      icon: Dumbbell,
      description:
        "Access an extensive movement library categorized by primary muscles (Chest, Back, Quads, Deltoids) and equipment types.",
      highlights: [
        "Filter by muscle group, category & equipment",
        "Detailed execution instructions & setup tips",
        "Create custom gym-specific exercises",
      ],
    },
    {
      title: "Assignment Distribution",
      tag: "Plan Delivery",
      route: "/assignments/all",
      routeLabel: "Manage Assignments",
      icon: ClipboardList,
      description:
        "Assign custom workout routines directly to specific athletes with assigned start dates and active status monitoring.",
      highlights: [
        "Targeted coach-to-member assignment modal",
        "Immediate delivery notification via Socket.IO",
        "Status tracking (Pending, In Progress, Completed)",
      ],
    },
    {
      title: "Athlete Telemetry & Review",
      tag: "Session Oversight",
      route: "/sessions",
      routeLabel: "Inspect Sessions",
      icon: Activity,
      description:
        "Review completed workout sessions with verified set entries, total tonnage lifted, member-submitted RPE, and equipment swap notes.",
      highlights: [
        "Verified set-by-set weight and repetition telemetry",
        "Audited in-session exercise swaps with reason logs",
        "Member RPE exertion score & post-workout reflections",
      ],
    },
  ];

  return (
    <section
      id="coaches"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-28 h-[380px] w-[500px] rounded-full bg-[#5BE584]/[0.06] blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2A3039]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-3">
              <Shield className="h-3.5 w-3.5" />
              For Coaches & Trainers
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12]">
              Precision programming and active roster oversight.
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[#A7B0BC] leading-relaxed">
            STREN gives coaches full control over training prescription, program distribution,
            and athlete performance monitoring in one unified hub.
          </p>
        </div>

        {/* Interactive Showcase: Feature Selector + High-Fidelity UI Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Feature Navigation List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {coachFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              const isActive = activeFeature === idx;
              return (
                <button
                  key={feat.title}
                  type="button"
                  onClick={() => setActiveFeature(idx)}
                  className={`group relative text-left rounded-[16px] border p-4 sm:p-5 transition-all duration-200 ${
                    isActive
                      ? "border-[#5BE584]/60 bg-gradient-to-r from-[#171D25] to-[#13171D] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_24px_rgba(91,229,132,0.08)]"
                      : "border-[#2A3039] bg-[#0E1218]/80 hover:border-[#38414D] hover:bg-[#13171D]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border transition-colors ${
                        isActive
                          ? "border-[#5BE584]/40 bg-[#5BE584]/15 text-[#5BE584]"
                          : "border-[#2A3039] bg-[#161B22] text-[#94A3B8] group-hover:text-[#F8FAFC]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isActive ? "text-[#5BE584]" : "text-[#94A3B8]"
                          }`}
                        >
                          {feat.tag}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] shadow-[0_0_8px_#5BE584]" />
                        )}
                      </div>
                      <h3
                        className={`text-sm sm:text-base font-bold transition-colors ${
                          isActive ? "text-[#F8FAFC]" : "text-[#D1D5DB]"
                        }`}
                      >
                        {feat.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Side: Realistic Coach Product Mockup */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="overflow-hidden rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
              {/* Window Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3039] bg-[#090B0F] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F5B942]/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#5BE584]" />
                  <span className="ml-2 text-xs font-semibold text-[#F8FAFC]">
                    STREN Coach Hub
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#5BE584]">
                    TRAINER ROLE
                  </span>
                  <span className="font-mono text-[11px] text-[#94A3B8]">
                    {coachFeatures[activeFeature].route}
                  </span>
                </div>
              </div>

              {/* Window Body Content */}
              <div className="p-5 sm:p-6 space-y-5 bg-[#0A0D12]">
                {/* Active Feature Detail Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[14px] border border-[#2A3039] bg-gradient-to-r from-[#171D25] to-[#12161E] p-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5BE584]">
                      Selected Module
                    </span>
                    <h4 className="text-base font-bold text-[#F8FAFC]">
                      {coachFeatures[activeFeature].title}
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {coachFeatures[activeFeature].description}
                    </p>
                  </div>
                  <Link
                    to={coachFeatures[activeFeature].route}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-[10px] bg-[#5BE584] px-3.5 py-2 text-xs font-semibold text-[#090B0F] shadow-[0_0_16px_rgba(91,229,132,0.25)] transition-all hover:bg-[#49D472] whitespace-nowrap"
                  >
                    {coachFeatures[activeFeature].routeLabel} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Key Verification Capabilities */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Engineered Capabilities
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {coachFeatures[activeFeature].highlights.map((point, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-[10px] border border-[#222832] bg-[#11161D] px-3.5 py-2.5 text-xs text-[#E2E8F0]"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5BE584]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concrete Realistic Interface Snippet */}
                <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#2A3039]/60">
                    <span className="font-medium text-[#F8FAFC]">Workout Builder Prescription Preview</span>
                    <span className="text-[11px] text-[#5BE584]">Target Targets Active</span>
                  </div>
                  <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1A222C] text-[#5BE584] font-bold text-xs">
                        #1
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#F8FAFC]">Barbell Back Squat</p>
                        <p className="text-[11px] text-[#94A3B8]">4 sets · Legs / Quads</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-[8px] bg-[#090B0F] border border-[#2A3039] px-2.5 py-1 text-[#94A3B8]">
                        Target: <strong className="text-[#F8FAFC]">140 kg</strong>
                      </span>
                      <span className="rounded-[8px] bg-[#090B0F] border border-[#2A3039] px-2.5 py-1 text-[#94A3B8]">
                        Target RPE: <strong className="text-[#5BE584]">8.5</strong>
                      </span>
                      <span className="rounded-[8px] bg-[#090B0F] border border-[#2A3039] px-2.5 py-1 text-[#94A3B8]">
                        Rest: <strong className="text-[#F8FAFC]">180s</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
