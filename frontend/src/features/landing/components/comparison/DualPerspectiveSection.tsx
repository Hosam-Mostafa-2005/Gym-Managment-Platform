// src/features/landing/components/comparison/DualPerspectiveSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Repeat,
  UserCheck,
  Zap,
} from "lucide-react";

export const DualPerspectiveSection: React.FC = () => {
  const { t } = useTranslation(["landing"]);

  const coachPoints = [
    {
      title: t("dualPerspective.coachSide.points.builder.title"),
      desc: t("dualPerspective.coachSide.points.builder.desc"),
    },
    {
      title: t("dualPerspective.coachSide.points.roster.title"),
      desc: t("dualPerspective.coachSide.points.roster.desc"),
    },
    {
      title: t("dualPerspective.coachSide.points.assignments.title"),
      desc: t("dualPerspective.coachSide.points.assignments.desc"),
    },
    {
      title: t("dualPerspective.coachSide.points.review.title"),
      desc: t("dualPerspective.coachSide.points.review.desc"),
    },
  ];

  const memberPoints = [
    {
      title: t("dualPerspective.memberSide.points.assignments.title"),
      desc: t("dualPerspective.memberSide.points.assignments.desc"),
    },
    {
      title: t("dualPerspective.memberSide.points.logging.title"),
      desc: t("dualPerspective.memberSide.points.logging.desc"),
    },
    {
      title: t("dualPerspective.memberSide.points.memory.title"),
      desc: t("dualPerspective.memberSide.points.memory.desc"),
    },
    {
      title: t("dualPerspective.memberSide.points.swapping.title"),
      desc: t("dualPerspective.memberSide.points.swapping.desc"),
    },
  ];

  return (
    <section
      id="perspectives"
      className="scroll-mt-20 sm:scroll-mt-24 relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
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
            {t("dualPerspective.badge")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC] leading-[1.12] mb-4">
            {t("dualPerspective.headline")}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#A7B0BC] leading-relaxed">
            {t("dualPerspective.description")}
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
                      {t("dualPerspective.coachSide.tag")}
                    </span>
                    <h3 className="text-lg font-bold text-[#F8FAFC]">
                      {t("dualPerspective.coachSide.title")}
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-mono text-[#94A3B8]" dir="ltr">
                  /coach-dashboard
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {t("dualPerspective.coachSide.description")}
              </p>

              <div className="mt-6 space-y-3">
                {coachPoints.map((item, i) => (
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
              <span>{t("dualPerspective.coachSide.link")}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
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
                  {t("dualPerspective.liveConnector.live")}
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8] text-center">
                  {t("dualPerspective.liveConnector.socket")}
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
                      {t("dualPerspective.memberSide.tag")}
                    </span>
                    <h3 className="text-lg font-bold text-[#F8FAFC]">
                      {t("dualPerspective.memberSide.title")}
                    </h3>
                  </div>
                </div>
                <span className="rounded-full bg-[#1A222C] border border-[#2A3039] px-2.5 py-0.5 text-[10px] font-mono text-[#94A3B8]" dir="ltr">
                  /dashboard
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {t("dualPerspective.memberSide.description")}
              </p>

              <div className="mt-6 space-y-3">
                {memberPoints.map((item, i) => (
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
              <span>{t("dualPerspective.memberSide.link")}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DualPerspectiveSection;
