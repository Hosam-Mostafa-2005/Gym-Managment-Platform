// src/features/landing/components/overview/PlatformOverview.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["landing"]);

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
            {t("platform.badge")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] mb-4 leading-[1.12]">
            {t("platform.headline")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            {t("platform.description")}
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
                      {t("platform.coachBlock.roleTag")}
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC]">
                      {t("platform.coachBlock.title")}
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-medium text-[#94A3B8]">
                  {t("platform.coachBlock.badge")}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {t("platform.coachBlock.description")}
              </p>

              {/* Coach Mini-Card Preview */}
              <div className="rounded-[16px] border border-[#2A3039] bg-[#090B0F]/90 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A3039]/60">
                  <span className="font-semibold text-[#F8FAFC]">
                    {t("platform.coachBlock.previewTitle")}
                  </span>
                  <span className="text-[#5BE584] font-medium">
                    {t("platform.coachBlock.previewAssigned")}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="text-[#F8FAFC] font-medium">
                      {t("platform.coachBlock.exercise1Name")}
                    </span>
                    <span className="text-[#94A3B8]">
                      {t("platform.coachBlock.exercise1Details")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="text-[#F8FAFC] font-medium">
                      {t("platform.coachBlock.exercise2Name")}
                    </span>
                    <span className="text-[#94A3B8]">
                      {t("platform.coachBlock.exercise2Details")}
                    </span>
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
                  {t("platform.liveSync")}
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
                      {t("platform.memberBlock.roleTag")}
                    </span>
                    <h3 className="text-base font-bold text-[#F8FAFC]">
                      {t("platform.memberBlock.title")}
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-medium text-[#5BE584]">
                  {t("platform.memberBlock.badge")}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {t("platform.memberBlock.description")}
              </p>

              {/* Member Mini-Card Preview */}
              <div className="rounded-[16px] border border-[#2A3039] bg-[#090B0F]/90 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A3039]/60">
                  <span className="font-semibold text-[#F8FAFC]">
                    {t("platform.memberBlock.previewTitle")}
                  </span>
                  <span className="text-xs text-[#22C55E] font-medium">
                    {t("platform.memberBlock.previewPrev")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="block text-[#94A3B8] text-[9px] uppercase">
                      {t("platform.memberBlock.weightLabel")}
                    </span>
                    <span className="font-bold text-[#F8FAFC]">82.5 kg</span>
                  </div>
                  <div className="bg-[#13171D] p-2 rounded-[8px] border border-[#222832]">
                    <span className="block text-[#94A3B8] text-[9px] uppercase">
                      {t("platform.memberBlock.repsLabel")}
                    </span>
                    <span className="font-bold text-[#F8FAFC]">8 reps</span>
                  </div>
                  <div className="bg-[#5BE584]/15 p-2 rounded-[8px] border border-[#5BE584]/35 text-[#5BE584]">
                    <span className="block text-[9px] uppercase font-semibold">
                      {t("platform.memberBlock.statusLabel")}
                    </span>
                    <span className="font-bold">{t("platform.memberBlock.loggedStatus")}</span>
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
                <strong className="text-[#F8FAFC]">
                  {t("platform.feedbackBanner.highlight")}{" "}
                </strong>
                {t("platform.feedbackBanner.text")}
              </p>
            </div>
            <Link
              to="/workout-library/exercises"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors whitespace-nowrap"
            >
              <span>{t("platform.feedbackBanner.link")}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
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
              {t("platform.pillars.targets.title")}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {t("platform.pillars.targets.description")}
            </p>
          </div>

          <div className="rounded-[20px] border border-[#2A3039] bg-[#12161D] p-6 flex flex-col gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <History className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              {t("platform.pillars.memory.title")}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {t("platform.pillars.memory.description")}
            </p>
          </div>

          <div className="rounded-[20px] border border-[#2A3039] bg-[#12161D] p-6 flex flex-col gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              {t("platform.pillars.telemetry.title")}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {t("platform.pillars.telemetry.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformOverview;
