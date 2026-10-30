// src/features/landing/components/members/MemberExperienceSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  History,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";

export const MemberExperienceSection: React.FC = () => {
  const { t } = useTranslation(["landing"]);
  const [activeStep, setActiveStep] = useState(2);

  const memberSteps = [
    {
      num: "01",
      title: t("members.steps.step1.title"),
      tag: t("members.steps.step1.tag"),
      route: "/assignments/all",
      description: t("members.steps.step1.description"),
      icon: Dumbbell,
    },
    {
      num: "02",
      title: t("members.steps.step2.title"),
      tag: t("members.steps.step2.tag"),
      route: "/sessions",
      description: t("members.steps.step2.description"),
      icon: Activity,
    },
    {
      num: "03",
      title: t("members.steps.step3.title"),
      tag: t("members.steps.step3.tag"),
      route: "/sessions",
      description: t("members.steps.step3.description"),
      icon: History,
    },
    {
      num: "04",
      title: t("members.steps.step4.title"),
      tag: t("members.steps.step4.tag"),
      route: "/sessions",
      description: t("members.steps.step4.description"),
      icon: RefreshCw,
    },
    {
      num: "05",
      title: t("members.steps.step5.title"),
      tag: t("members.steps.step5.tag"),
      route: "/dashboard",
      description: t("members.steps.step5.description"),
      icon: Trophy,
    },
  ];

  return (
    <section
      id="members"
      className="scroll-mt-20 sm:scroll-mt-24 relative overflow-hidden border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0D1117_50%,#090B0F_100%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 -right-28 h-[400px] w-[500px] rounded-full bg-[#5BE584]/[0.06] blur-[150px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col gap-12 sm:gap-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2A3039]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              {t("members.badge")}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12]">
              {t("members.headline")}
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-[#A7B0BC] leading-relaxed">
            {t("members.description")}
          </p>
        </div>

        {/* 5-Step Visual Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {memberSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`relative flex flex-col justify-between rounded-[18px] border p-4 sm:p-5 text-left rtl:text-right transition-all duration-200 ${
                  isSelected
                    ? "border-[#5BE584] bg-[#141A22] shadow-[0_10px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(91,229,132,0.1)] -translate-y-1"
                    : "border-[#2A3039] bg-[#0F131A] hover:border-[#38414D] hover:bg-[#13171D]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? "text-[#5BE584]" : "text-[#94A3B8]"
                      }`}
                    >
                      {step.num}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-[10px] border ${
                        isSelected
                          ? "border-[#5BE584]/40 bg-[#5BE584]/15 text-[#5BE584]"
                          : "border-[#2A3039] bg-[#090B0F] text-[#94A3B8]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <span
                    className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                      isSelected ? "text-[#5BE584]" : "text-[#94A3B8]"
                    }`}
                  >
                    {step.tag}
                  </span>
                  <h3
                    className={`text-sm font-bold leading-tight ${
                      isSelected ? "text-[#F8FAFC]" : "text-[#D1D5DB]"
                    }`}
                  >
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 text-[11px] text-[#94A3B8] leading-relaxed">
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Active Workout Showcase Workbench */}
        <div className="overflow-hidden rounded-[24px] border border-[#2A3039] bg-[#11151C] shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_32px_rgba(91,229,132,0.05)]">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3039] bg-[#090B0F] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-[#22C55E] animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  {t("members.workbench.headerTitle")}
                </h3>
                <p className="text-[11px] text-[#94A3B8]">
                  {t("members.workbench.headerSubtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-xs font-mono font-semibold text-[#5BE584]">
                <Clock className="h-3.5 w-3.5" /> {t("members.workbench.activeStatus")}
              </div>
              <Link
                to="/sessions"
                className="inline-flex items-center gap-1 rounded-[10px] bg-[#5BE584] px-3 py-1.5 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472]"
              >
                <span>{t("members.workbench.goToSessions")}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Workbench Body */}
          <div className="p-5 sm:p-6 lg:p-8 space-y-6">
            {/* Active Exercise Card */}
            <div className="rounded-[18px] border border-[#2A3039] bg-[#090B0F] p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A3039]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-[8px] bg-[#5BE584]/15 border border-[#5BE584]/30 px-2 py-0.5 text-[10px] font-bold text-[#5BE584] uppercase">
                      {t("members.workbench.movementTag")}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
                      {t("members.workbench.movementMuscle")}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[#F8FAFC] mt-1">
                    {t("members.workbench.exerciseName")}
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    {t("members.workbench.coachTarget")}
                  </p>
                </div>

                {/* In-Session Swap Feature Callout */}
                <div className="flex items-center gap-2 self-start sm:self-auto rounded-[12px] border border-[#2A3039] bg-[#141A22] p-2 sm:px-3 text-xs">
                  <RefreshCw className="h-4 w-4 text-[#5BE584]" />
                  <div>
                    <span className="block font-semibold text-[#F8FAFC]">
                      {t("members.workbench.swapTitle")}
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      {t("members.workbench.swapSubtitle")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Set Logging Table with Previous Performance Memory */}
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead>
                    <tr className="border-b border-[#2A3039] text-[#94A3B8]">
                      <th className="pb-2.5 font-semibold">
                        {t("members.workbench.table.set")}
                      </th>
                      <th className="pb-2.5 font-semibold">
                        {t("members.workbench.table.prevPerformance")}
                      </th>
                      <th className="pb-2.5 font-semibold">
                        {t("members.workbench.table.target")}
                      </th>
                      <th className="pb-2.5 font-semibold">
                        {t("members.workbench.table.weight")}
                      </th>
                      <th className="pb-2.5 font-semibold">
                        {t("members.workbench.table.reps")}
                      </th>
                      <th className="pb-2.5 font-semibold text-right rtl:text-left">
                        {t("members.workbench.table.action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E252F]">
                    {/* Set 1: Completed */}
                    <tr className="text-[#94A3B8]">
                      <td className="py-3 font-bold text-[#F8FAFC]">1</td>
                      <td className="py-3 font-mono text-[#22C55E]">80 kg × 10</td>
                      <td className="py-3 text-[#94A3B8]">82.5 kg × 10</td>
                      <td className="py-3 font-mono font-bold text-[#F8FAFC]">82.5 kg</td>
                      <td className="py-3 font-mono font-bold text-[#F8FAFC]">10 reps</td>
                      <td className="py-3 text-right rtl:text-left">
                        <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2.5 py-1 text-[11px] font-semibold text-[#22C55E]">
                          <CheckCircle2 className="h-3 w-3" />{" "}
                          {t("members.workbench.table.logged")}
                        </span>
                      </td>
                    </tr>

                    {/* Set 2: Active Logging */}
                    <tr className="bg-[#141A22]/70 text-[#F8FAFC]">
                      <td className="py-3 font-bold text-[#5BE584]">2</td>
                      <td className="py-3 font-mono text-[#22C55E]">
                        82.5 kg × 8{" "}
                        <span className="text-[10px] text-[#94A3B8]">
                          {t("members.workbench.table.lastWeek")}
                        </span>
                      </td>
                      <td className="py-3 text-[#5BE584]">85 kg × 8</td>
                      <td className="py-3">
                        <div className="inline-flex items-center rounded-[8px] border border-[#5BE584]/60 bg-[#090B0F] px-2.5 py-1 font-mono font-bold text-[#F8FAFC]">
                          85.0
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="inline-flex items-center rounded-[8px] border border-[#5BE584]/60 bg-[#090B0F] px-2.5 py-1 font-mono font-bold text-[#F8FAFC]">
                          8
                        </div>
                      </td>
                      <td className="py-3 text-right rtl:text-left">
                        <button
                          type="button"
                          className="rounded-[8px] bg-[#5BE584] px-3 py-1 text-[11px] font-bold text-[#090B0F] shadow-[0_0_12px_rgba(91,229,132,0.3)] transition-all hover:bg-[#49D472]"
                        >
                          {t("members.workbench.table.completeSet")}
                        </button>
                      </td>
                    </tr>

                    {/* Set 3: Upcoming */}
                    <tr className="text-[#94A3B8]">
                      <td className="py-3 font-bold text-[#94A3B8]">3</td>
                      <td className="py-3 font-mono text-[#94A3B8]">82.5 kg × 8</td>
                      <td className="py-3 text-[#94A3B8]">85 kg × 8</td>
                      <td className="py-3 font-mono text-[#94A3B8]">--</td>
                      <td className="py-3 font-mono text-[#94A3B8]">--</td>
                      <td className="py-3 text-right rtl:text-left text-[11px] text-[#94A3B8]">
                        {t("members.workbench.table.pending")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Post-Session RPE Exertion & Telemetry Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {t("members.workbench.metrics.sessionTonnage")}
                  </span>
                  <p className="text-xl font-extrabold text-[#F8FAFC] mt-0.5">3,420 kg</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/30">
                  <Dumbbell className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {t("members.workbench.metrics.targetRpe")}
                  </span>
                  <p className="text-xl font-extrabold text-[#5BE584] mt-0.5">8.5 / 10</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/30">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {t("members.workbench.metrics.restTimer")}
                  </span>
                  <p className="text-xl font-extrabold text-[#22C55E] mt-0.5">
                    {t("members.workbench.metrics.restLeft")}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemberExperienceSection;
