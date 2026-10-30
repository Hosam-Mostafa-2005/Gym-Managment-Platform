// src/features/landing/components/hero/HeroSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { HeroBadge } from "./HeroBadge";
import { HeroProductPreview } from "./HeroProductPreview";

export const HeroSection: React.FC = () => {
  const { t } = useTranslation(["landing"]);
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase();
  const isCoachOrAdmin = userRole === "TRAINER" || userRole === "ADMIN";

  const primaryDashboardPath = isCoachOrAdmin ? "/coach-dashboard" : "/dashboard";

  const primaryDashboardLabel = isCoachOrAdmin
    ? t("hero.actions.openCoachDashboard")
    : t("hero.actions.openMemberDashboard");

  return (
    <section className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] bg-[radial-gradient(ellipse_at_top_right,rgba(91,229,132,0.11),transparent_48%),radial-gradient(ellipse_at_bottom_left,rgba(91,229,132,0.06),transparent_45%)] py-14 sm:py-20 lg:py-24">
      {/* Architectural grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(42,48,57,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(42,48,57,0.22)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_30%,transparent_100%)]"
      />

      {/* Ambient glowing illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[360px] w-[580px] -translate-x-1/2 rounded-full bg-[#5BE584]/[0.07] blur-[130px] motion-safe:animate-pulse [animation-duration:8s]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-24 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#5BE584]/[0.08] blur-[140px]"
      />

      {/* Subtle bottom specular divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/35 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Narrative Copy & Primary CTAs */}
          <div className="flex flex-col items-start gap-6 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <HeroBadge text={t("hero.badge")} />
              {user?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2A3039] bg-gradient-to-b from-[#171C24] to-[#13171D] px-3 py-1 text-xs font-medium text-[#94A3B8] shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#5BE584]" />
                  {t("hero.signedInAs")}{" "}
                  <strong className="text-[#F8FAFC]">{user.name}</strong>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#F8FAFC] sm:text-5xl lg:text-[3.5rem] leading-[1.06]">
                {t("hero.headlinePart1")} <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#5BE584] via-[#7CF29C] to-[#49D472] bg-clip-text text-transparent">
                  {t("hero.headlinePart2")}
                </span>
              </h1>
            </div>

            <p className="max-w-xl text-base sm:text-lg text-[#A7B0BC] leading-relaxed">
              {t("hero.description")}
            </p>

            {/* CTAs */}
            <div className="mt-1 flex flex-col w-full sm:w-auto sm:flex-row gap-3.5">
              {user ? (
                <>
                  <Link
                    to={primaryDashboardPath}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-7 text-sm font-semibold text-[#090B0F] shadow-[0_0_28px_rgba(91,229,132,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_38px_rgba(91,229,132,0.45)]"
                  >
                    <span>{primaryDashboardLabel}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#2A3039] bg-gradient-to-b from-[#171C24] to-[#13171D] px-6 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#1B2028]"
                  >
                    {t("hero.actions.exploreWorkflows")}
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-7 text-sm font-semibold text-[#090B0F] shadow-[0_0_28px_rgba(91,229,132,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_38px_rgba(91,229,132,0.45)]"
                  >
                    <span>{t("hero.actions.startCoachingOrTraining")}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#2A3039] bg-gradient-to-b from-[#171C24] to-[#13171D] px-6 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#1B2028]"
                  >
                    {t("hero.actions.exploreWorkflows")}
                  </a>
                </>
              )}
            </div>

            {/* Feature highlights */}
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
                {t("hero.highlights.targetPrescription")}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
                {t("hero.highlights.exerciseSwapping")}
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Sparkles className="h-4 w-4 text-[#5BE584]" />
                {t("hero.highlights.liveTelemetry")}
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Realistic Product Preview */}
          <div className="relative w-full lg:col-span-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#5BE584]/15 via-transparent to-[#5BE584]/10 blur-2xl"
            />
            <HeroProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
