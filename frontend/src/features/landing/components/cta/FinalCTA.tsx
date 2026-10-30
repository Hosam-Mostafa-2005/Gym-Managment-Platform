// src/features/landing/components/cta/FinalCTA.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export const FinalCTA: React.FC = () => {
  const { t } = useTranslation(["landing"]);
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase();
  const isCoachOrAdmin = userRole === "TRAINER" || userRole === "ADMIN";

  const primaryDashboardPath = isCoachOrAdmin ? "/coach-dashboard" : "/dashboard";
  const primaryDashboardLabel = isCoachOrAdmin
    ? t("cta.actions.openCoachDashboard")
    : t("cta.actions.openMemberDashboard");

  return (
    <section
      id="cta"
      className="scroll-mt-20 sm:scroll-mt-24 relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] py-18 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient radial glow behind CTA card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[720px] rounded-full bg-[#5BE584]/[0.08] blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-[920px] overflow-hidden rounded-[24px] border border-[#2A3039] bg-gradient-to-b from-[#161C24] via-[#12161D] to-[#0D1016] p-8 sm:p-14 md:p-16 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(91,229,132,0.06)]">
        {/* Top specular hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/60 to-transparent"
        />

        {/* Decorative corner highlights */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full border border-[#5BE584]/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full border border-[#5BE584]/15"
        />

        <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/35 bg-[#5BE584]/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          {t("cta.badge")}
        </span>

        <h2 className="relative z-10 mb-4 text-3xl sm:text-5xl font-extrabold tracking-[-0.035em] text-[#F8FAFC] leading-[1.12]">
          {t("cta.headlinePart1")} <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#5BE584] via-[#7CF29C] to-[#49D472] bg-clip-text text-transparent">
            {t("cta.headlinePart2")}
          </span>
        </h2>

        <p className="relative z-10 mb-8 text-sm sm:text-base lg:text-lg text-[#A7B0BC] max-w-xl mx-auto leading-relaxed">
          {t("cta.description")}
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {user ? (
            <>
              <Link
                to={primaryDashboardPath}
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-8 text-sm font-semibold text-[#090B0F] shadow-[0_0_28px_rgba(91,229,132,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_38px_rgba(91,229,132,0.45)]"
              >
                <span>{primaryDashboardLabel}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                to="/workout-library/exercises"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#090B0F] px-8 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#13171D]"
              >
                {t("cta.actions.browseExerciseLibrary")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-8 text-sm font-semibold text-[#090B0F] shadow-[0_0_28px_rgba(91,229,132,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_38px_rgba(91,229,132,0.45)]"
              >
                <span>{t("cta.actions.startTrainingOrCoaching")}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#090B0F] px-8 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#13171D]"
              >
                {t("cta.actions.signInToWorkspace")}
              </Link>
            </>
          )}
        </div>

        {/* Confidence Indicators */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584]" />
            {t("cta.trust.freeSetup")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584]" />
            {t("cta.trust.dedicatedInterfaces")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584]" />
            {t("cta.trust.socketSync")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
