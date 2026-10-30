// src/features/landing/components/hero/HeroProductPreview.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Check,
  Clock,
  Dumbbell,
  Target,
} from "lucide-react";

export const HeroProductPreview: React.FC = () => {
  const { t } = useTranslation(["landing"]);
  const [activeTab, setActiveTab] = useState<"live" | "coach">("live");

  return (
    <div className="relative w-full rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151A21] via-[#12161D] to-[#0A0D12] p-3 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(91,229,132,0.06)] overflow-hidden">
      {/* Top Specular Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/60 to-transparent"
      />

      {/* Perspective Switcher Mini-Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3039]/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#5BE584] text-[#090B0F]">
            <Dumbbell className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F8FAFC]">
                {t("heroPreview.liveTraining")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-2 py-0.5 text-[9px] font-bold text-[#5BE584]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] animate-pulse" />
                {t("heroPreview.activeLog")}
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8]">
              {t("heroPreview.coachAthlete", { coach: "Coach Alex", athlete: "Jordan Vance" })}
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border border-[#2A3039] bg-[#090B0F] p-0.5 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              activeTab === "live"
                ? "bg-[#5BE584] text-[#090B0F]"
                : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            {t("heroPreview.tabs.athleteSession")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coach")}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              activeTab === "coach"
                ? "bg-[#1E2329] text-[#5BE584]"
                : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            {t("heroPreview.tabs.coachPrescription")}
          </button>
        </div>
      </div>

      {activeTab === "live" ? (
        <div className="space-y-3.5">
          {/* Active Workout Banner Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2A3039] bg-[#0E1217] p-3 sm:p-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                {t("heroPreview.banner.assignedRoutine")}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {t("heroPreview.banner.routineTitle")}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-[#2A3039] bg-[#090B0F] px-2.5 py-1 text-xs font-mono font-bold text-[#5BE584]">
                <Clock className="h-3.5 w-3.5" />
                <span>34:18</span>
              </div>
              <div className="rounded-lg border border-[#23422E] bg-[#16291D] px-2.5 py-1 text-[11px] font-bold text-[#5BE584]">
                {t("heroPreview.banner.movementsDone")}
              </div>
            </div>
          </div>

          {/* Current Movement Card: Barbell Back Squat */}
          <div className="rounded-xl border border-[#2A3039] bg-[#0E1217] p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#5BE584]/15 border border-[#5BE584]/30 text-xs font-bold text-[#5BE584]">
                  #1
                </span>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-white">
                    {t("heroPreview.movement.name")}
                  </h5>
                  <span className="text-[10px] text-[#94A3B8]">
                    {t("heroPreview.movement.prescribed")}
                  </span>
                </div>
              </div>

              {/* Prescription Target Tag */}
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[#5BE584]/30 bg-[#5BE584]/10 px-2 py-0.5 text-[10px] font-bold text-[#5BE584]">
                <Target className="h-3 w-3" /> {t("heroPreview.movement.target")}
              </span>
            </div>

            {/* Set Table Simulation */}
            <div className="space-y-1.5 font-mono text-xs">
              {/* Completed Set 1 */}
              <div className="grid grid-cols-12 items-center gap-2 rounded-lg bg-[#5BE584]/5 border border-[#5BE584]/20 px-3 py-2 text-[#94A3B8]">
                <span className="col-span-2 text-xs font-bold text-[#5BE584]">
                  {t("heroPreview.sets.setLabel", { num: 1 })}
                </span>
                <span className="col-span-3 text-[11px] text-gray-400">
                  {t("heroPreview.sets.targetReps", { reps: 6 })}
                </span>
                <span className="col-span-4 text-xs font-bold text-white">
                  95 kg × 6
                </span>
                <div className="col-span-3 flex justify-end">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-[#5BE584] text-[#090B0F]">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* Completed Set 2 */}
              <div className="grid grid-cols-12 items-center gap-2 rounded-lg bg-[#5BE584]/5 border border-[#5BE584]/20 px-3 py-2 text-[#94A3B8]">
                <span className="col-span-2 text-xs font-bold text-[#5BE584]">
                  {t("heroPreview.sets.setLabel", { num: 2 })}
                </span>
                <span className="col-span-3 text-[11px] text-gray-400">
                  {t("heroPreview.sets.targetReps", { reps: 6 })}
                </span>
                <span className="col-span-4 text-xs font-bold text-white">
                  100 kg × 6
                </span>
                <div className="col-span-3 flex justify-end">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-[#5BE584] text-[#090B0F]">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </div>
              </div>

              {/* Active Set 3 (Currently Logging) */}
              <div className="grid grid-cols-12 items-center gap-2 rounded-lg bg-[#141920] border border-[#5BE584]/40 px-3 py-2 shadow-[0_0_15px_rgba(91,229,132,0.1)]">
                <span className="col-span-2 text-xs font-bold text-[#5BE584]">
                  {t("heroPreview.sets.setLabel", { num: 3 })}
                </span>
                <span className="col-span-3 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit">
                  {t("heroPreview.sets.prevBenchmark", { weight: 100, reps: 6 })}
                </span>
                <span className="col-span-4 text-xs font-bold text-white font-mono">
                  {t("heroPreview.sets.activeLog", { weight: 100, reps: 6 })}
                </span>
                <div className="col-span-3 flex justify-end">
                  <button
                    type="button"
                    aria-label="Confirm completed set"
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#5BE584] text-[#090B0F] hover:bg-[#4ade80] transition-colors shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Rest Timer Pill */}
            <div className="flex items-center justify-between rounded-lg border border-[#2A3039] bg-[#090B0F] px-3 py-2 text-[11px]">
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Clock className="h-3.5 w-3.5 text-[#5BE584]" />
                <span>{t("heroPreview.restTimer.ticking")}</span>
              </div>
              <span className="font-mono font-bold text-[#5BE584]">
                {t("heroPreview.restTimer.timeLeft", { time: "01:42" })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Coach Prescription View */
        <div className="space-y-3.5">
          <div className="rounded-xl border border-[#2A3039] bg-[#0E1217] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#5BE584] uppercase tracking-wider">
                  {t("heroPreview.coach.prescriptionTitle")}
                </span>
                <h4 className="text-sm font-bold text-white">
                  {t("heroPreview.coach.athleteParameters")}
                </h4>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]">
                {t("heroPreview.coach.assignee", { name: "Jordan Vance" })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-[#1E2329] bg-[#090B0F] p-3">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                  {t("heroPreview.coach.targetLoad")}
                </span>
                <p className="text-lg font-black text-white font-mono mt-0.5">
                  100.0 <span className="text-xs text-[#5BE584]">{t("heroPreview.coach.targetLoadUnit")}</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {t("heroPreview.coach.targetLoadNote")}
                </p>
              </div>

              <div className="rounded-lg border border-[#1E2329] bg-[#090B0F] p-3">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                  {t("heroPreview.coach.targetExertion")}
                </span>
                <p className="text-lg font-black text-[#5BE584] font-mono mt-0.5">
                  {t("heroPreview.coach.targetExertionValue")}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {t("heroPreview.coach.targetExertionNote")}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[#1E2329] bg-[#090B0F] p-3">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                {t("heroPreview.coach.directInstructions")}
              </span>
              <p className="text-xs text-[#F8FAFC] leading-relaxed mt-1">
                {t("heroPreview.coach.instructionText")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Metrics Row */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#2A3039]/60 pt-3 text-[11px] text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-[#5BE584]" />
          <span>{t("heroPreview.footer.bidirectionalSync")}</span>
        </div>
        <div className="font-mono text-white">
          {t("heroPreview.footer.sessionVolume")}{" "}
          <span className="font-bold text-[#5BE584]">4,200 kg</span>
        </div>
      </div>
    </div>
  );
};

export default HeroProductPreview;
