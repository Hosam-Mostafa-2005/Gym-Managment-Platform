// src/features/landing/components/features/FeaturesInContext.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["landing"]);

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
            {t("features.badge")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12] mb-4">
            {t("features.headline")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            {t("features.description")}
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
                  {t("features.bento1.badge")}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {t("features.bento1.source")}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
                {t("features.bento1.title")}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed max-w-xl">
                {t("features.bento1.description")}
              </p>
            </div>

            {/* Visual Interface Preview */}
            <div className="rounded-[16px] border border-[#2A3039] bg-[#090B0F] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8] pb-2 border-b border-[#2A3039]/60">
                <span className="font-semibold text-[#F8FAFC]">
                  {t("features.bento1.previewHeader")}
                </span>
                <span className="text-[#5BE584]">
                  {t("features.bento1.previewStatus")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3">
                  <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
                    {t("features.bento1.targetLoadLabel")}
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#F8FAFC]">
                    {t("features.bento1.targetLoadValue")}
                  </p>
                  <p className="text-[10px] text-[#22C55E] mt-0.5">
                    {t("features.bento1.targetLoadNote")}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3">
                  <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
                    {t("features.bento1.targetRpeLabel")}
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#5BE584]">
                    {t("features.bento1.targetRpeValue")}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">
                    {t("features.bento1.targetRpeNote")}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] p-3">
                  <span className="block text-[10px] uppercase font-semibold text-[#94A3B8]">
                    {t("features.bento1.restIntervalLabel")}
                  </span>
                  <p className="mt-1 text-base font-extrabold text-[#F8FAFC]">
                    {t("features.bento1.restIntervalValue")}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">
                    {t("features.bento1.restIntervalNote")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2A3039]/60 text-xs">
              <span className="text-[#94A3B8]">{t("features.bento1.footer")}</span>
              <Link
                to="/workout-builder/all"
                className="inline-flex items-center gap-1 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors"
              >
                <span>{t("features.bento1.link")}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: In-Session Exercise Swapping */}
          <div className="rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8] rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-2.5 py-0.5">
                  {t("features.bento2.badge")}
                </span>
                <RefreshCw className="h-4 w-4 text-[#38BDF8]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                {t("features.bento2.title")}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
                {t("features.bento2.description")}
              </p>
            </div>

            {/* Visual Swap Modal Snippet */}
            <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 space-y-2.5 text-xs">
              <div className="text-[11px] font-semibold text-[#94A3B8]">
                {t("features.bento2.eventTitle")}
              </div>
              <div className="flex items-center justify-between rounded-[8px] bg-[#161B22] p-2.5 border border-[#222832]">
                <div>
                  <p className="font-bold text-[#F8FAFC]">
                    {t("features.bento2.originalName")}
                  </p>
                  <p className="text-[10px] text-[#EF4444]">
                    {t("features.bento2.originalStatus")}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] rtl:rotate-180" />
                <div className="text-right rtl:text-left">
                  <p className="font-bold text-[#5BE584]">
                    {t("features.bento2.newName")}
                  </p>
                  <p className="text-[10px] text-[#22C55E]">
                    {t("features.bento2.newStatus")}
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-[#94A3B8] italic">
                {t("features.bento2.coachNote")}
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A3039]/60 text-xs text-[#94A3B8]">
              {t("features.bento2.footer")}
            </div>
          </div>

          {/* Bento Card 3: Previous Performance Benchmark Memory */}
          <div className="rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#22C55E] rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 px-2.5 py-0.5">
                  {t("features.bento3.badge")}
                </span>
                <Clock className="h-4 w-4 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
                {t("features.bento3.title")}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
                {t("features.bento3.description")}
              </p>
            </div>

            {/* Visual Benchmark Pill */}
            <div className="rounded-[14px] border border-[#2A3039] bg-[#090B0F] p-4 space-y-2 text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                {t("features.bento3.header")}
              </span>
              <div className="flex items-center justify-between rounded-[8px] bg-[#141A22] p-2.5 border border-[#222832]">
                <span className="text-[#94A3B8]">{t("features.bento3.prevLabel")}</span>
                <span className="font-mono font-bold text-[#22C55E]">
                  {t("features.bento3.prevValue")}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[8px] bg-[#5BE584]/10 p-2.5 border border-[#5BE584]/30">
                <span className="text-[#F8FAFC] font-semibold">
                  {t("features.bento3.targetLabel")}
                </span>
                <span className="font-mono font-bold text-[#5BE584]">
                  {t("features.bento3.targetValue")}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A3039]/60 text-xs text-[#94A3B8]">
              {t("features.bento3.footer")}
            </div>
          </div>

          {/* Bento Card 4: Physical Body Metrics & Circumferences (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#151B23] to-[#10141A] p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A78BFA] rounded-full bg-[#A78BFA]/15 border border-[#A78BFA]/30 px-2.5 py-0.5">
                  {t("features.bento4.badge")}
                </span>
                <Ruler className="h-4 w-4 text-[#A78BFA]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
                {t("features.bento4.title")}
              </h3>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed max-w-xl">
                {t("features.bento4.description")}
              </p>
            </div>

            {/* Visual Measurement Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  {t("features.bento4.weightLabel")}
                </span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                  {t("features.bento4.weightValue")}
                </p>
                <span className="text-[10px] text-[#22C55E]">
                  {t("features.bento4.weightDelta")}
                </span>
              </div>
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  {t("features.bento4.fatLabel")}
                </span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                  {t("features.bento4.fatValue")}
                </p>
                <span className="text-[10px] text-[#22C55E]">
                  {t("features.bento4.fatDelta")}
                </span>
              </div>
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  {t("features.bento4.chestLabel")}
                </span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                  {t("features.bento4.chestValue")}
                </p>
                <span className="text-[10px] text-[#5BE584]">
                  {t("features.bento4.chestDelta")}
                </span>
              </div>
              <div className="rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  {t("features.bento4.waistLabel")}
                </span>
                <p className="mt-1 text-lg font-bold text-[#F8FAFC]">
                  {t("features.bento4.waistValue")}
                </p>
                <span className="text-[10px] text-[#22C55E]">
                  {t("features.bento4.waistDelta")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2A3039]/60 text-xs">
              <span className="text-[#94A3B8]">{t("features.bento4.footer")}</span>
              <Link
                to="/measurements"
                className="inline-flex items-center gap-1 font-semibold text-[#5BE584] hover:text-[#49D472] transition-colors"
              >
                <span>{t("features.bento4.link")}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
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
              <h4 className="text-sm font-bold text-[#F8FAFC]">
                {t("features.supporting.card1.title")}
              </h4>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                {t("features.supporting.card1.description")}
              </p>
              <Link
                to="/workout-library/exercises"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] hover:underline"
              >
                <span>{t("features.supporting.card1.link")}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#2A3039] bg-[#0F131A] p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">
                {t("features.supporting.card2.title")}
              </h4>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                {t("features.supporting.card2.description")}
              </p>
              <Link
                to="/notifications"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] hover:underline"
              >
                <span>{t("features.supporting.card2.link")}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#2A3039] bg-[#0F131A] p-5 flex items-start gap-4 sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584]/15 border border-[#5BE584]/30 text-[#5BE584]">
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">
                {t("features.supporting.card3.title")}
              </h4>
              <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">
                {t("features.supporting.card3.description")}
              </p>
              <Link
                to="/sessions"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5BE584] hover:underline"
              >
                <span>{t("features.supporting.card3.link")}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesInContext;
