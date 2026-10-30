// src/features/landing/components/how-it-works/HowItWorksSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["landing"]);
  const [activeStage, setActiveStage] = useState(3);

  const stages = [
    {
      num: 1,
      actor: t("howItWorks.stages.stage1.actor"),
      actorBadge: t("howItWorks.stages.stage1.actorBadge"),
      actorColor: "text-[#5BE584] bg-[#5BE584]/15 border-[#5BE584]/35",
      title: t("howItWorks.stages.stage1.title"),
      description: t("howItWorks.stages.stage1.description"),
      route: "/workout-builder/all",
      routeLabel: t("howItWorks.stages.stage1.routeLabel"),
      icon: Dumbbell,
    },
    {
      num: 2,
      actor: t("howItWorks.stages.stage2.actor"),
      actorBadge: t("howItWorks.stages.stage2.actorBadge"),
      actorColor: "text-[#5BE584] bg-[#5BE584]/15 border-[#5BE584]/35",
      title: t("howItWorks.stages.stage2.title"),
      description: t("howItWorks.stages.stage2.description"),
      route: "/assignments/all",
      routeLabel: t("howItWorks.stages.stage2.routeLabel"),
      icon: ClipboardList,
    },
    {
      num: 3,
      actor: t("howItWorks.stages.stage3.actor"),
      actorBadge: t("howItWorks.stages.stage3.actorBadge"),
      actorColor: "text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/35",
      title: t("howItWorks.stages.stage3.title"),
      description: t("howItWorks.stages.stage3.description"),
      route: "/notifications",
      routeLabel: t("howItWorks.stages.stage3.routeLabel"),
      icon: Bell,
    },
    {
      num: 4,
      actor: t("howItWorks.stages.stage4.actor"),
      actorBadge: t("howItWorks.stages.stage4.actorBadge"),
      actorColor: "text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/35",
      title: t("howItWorks.stages.stage4.title"),
      description: t("howItWorks.stages.stage4.description"),
      route: "/sessions",
      routeLabel: t("howItWorks.stages.stage4.routeLabel"),
      icon: History,
    },
    {
      num: 5,
      actor: t("howItWorks.stages.stage5.actor"),
      actorBadge: t("howItWorks.stages.stage5.actorBadge"),
      actorColor: "text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/35",
      title: t("howItWorks.stages.stage5.title"),
      description: t("howItWorks.stages.stage5.description"),
      route: "/dashboard",
      routeLabel: t("howItWorks.stages.stage5.routeLabel"),
      icon: Trophy,
    },
    {
      num: 6,
      actor: t("howItWorks.stages.stage6.actor"),
      actorBadge: t("howItWorks.stages.stage6.actorBadge"),
      actorColor: "text-[#A78BFA] bg-[#A78BFA]/15 border-[#A78BFA]/35",
      title: t("howItWorks.stages.stage6.title"),
      description: t("howItWorks.stages.stage6.description"),
      route: "/coach-dashboard",
      routeLabel: t("howItWorks.stages.stage6.routeLabel"),
      icon: LineChart,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 sm:scroll-mt-24 relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
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
            {t("howItWorks.badge")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12] mb-4">
            {t("howItWorks.headline")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            {t("howItWorks.description")}
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
                  className={`group relative flex flex-col justify-between rounded-[20px] border p-5 text-left rtl:text-right transition-all duration-200 ${
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
                        {t("howItWorks.stagePrefix", { num: stg.num })}
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
                      className={`h-3.5 w-3.5 transition-transform rtl:rotate-180 ${
                        isSelected ? "text-[#5BE584] translate-x-0.5 rtl:-translate-x-0.5" : "text-[#94A3B8]"
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
                  {t("howItWorks.stageFocus", { num: stages[activeStage].num })}
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
            <span>{t("howItWorks.openStage", { label: stages[activeStage].routeLabel })}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
