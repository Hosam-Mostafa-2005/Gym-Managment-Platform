// src/features/landing/components/hero/HeroSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { HeroBadge } from "./HeroBadge";
import { HeroProductPreview } from "./HeroProductPreview";

export const HeroSection: React.FC = () => {
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase() || "MEMBER";
  const isCoachOrAdmin = userRole === "TRAINER" || userRole === "ADMIN";

  const roleLabel =
    userRole === "TRAINER"
      ? "Coach Workspace"
      : userRole === "ADMIN"
        ? "Admin Workspace"
        : "Member Workspace";

  const primaryDashboardPath =
    userRole === "TRAINER" ? "/coach-dashboard" : "/dashboard";

  const primaryDashboardLabel =
    userRole === "TRAINER" ? "Open Coach Dashboard" : "Open Dashboard";

  return (
    <section className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] bg-[radial-gradient(ellipse_at_top_right,rgba(91,229,132,0.09),transparent_48%),radial-gradient(ellipse_at_bottom_left,rgba(91,229,132,0.05),transparent_45%)] py-12 sm:py-16 lg:py-20">
      {/* Faint radially-masked architectural grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(42,48,57,0.24)_1px,transparent_1px),linear-gradient(to_bottom,rgba(42,48,57,0.24)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_30%,transparent_100%)]"
      />

      {/* Softly blurred ambient orbs (respects prefers-reduced-motion) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[340px] w-[560px] -translate-x-1/2 rounded-full bg-[#5BE584]/[0.06] blur-[120px] motion-safe:animate-pulse [animation-duration:8s]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-24 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[#5BE584]/[0.08] blur-[130px]"
      />

      {/* Subtle bottom section glow divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/35 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Authenticated Welcome & Workspace Entry Actions */}
          <div className="flex flex-col items-start gap-5 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <HeroBadge text={`STREN · ${roleLabel}`} />
              {user?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2A3039] bg-gradient-to-b from-[#171C24] to-[#13171D] px-3 py-1 text-xs font-medium text-[#94A3B8] shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#5BE584]" />
                  Signed in as <strong className="text-[#F8FAFC]">{user.name}</strong>
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#F8FAFC] sm:text-5xl lg:text-[3.25rem] leading-[1.08]">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.{" "}
              <span className="bg-gradient-to-r from-[#5BE584] via-[#7CF29C] to-[#49D472] bg-clip-text text-transparent">
                Your training hub is ready.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base lg:text-lg text-[#94A3B8] leading-relaxed">
              {isCoachOrAdmin
                ? "Manage your active member roster, build structured workout templates, assign training programs, and monitor athlete progression from your connected workspace."
                : "Access your assigned training plans, launch live workout sessions to log sets and reps, and track your body measurements and performance milestones."}
            </p>

            <div className="mt-2 flex flex-col w-full sm:w-auto sm:flex-row gap-3.5">
              <Link
                to={primaryDashboardPath}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-6 text-sm font-semibold text-[#090B0F] shadow-[0_0_26px_rgba(91,229,132,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_36px_rgba(91,229,132,0.42)]"
              >
                {primaryDashboardLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={isCoachOrAdmin ? "/assignments/all" : "/sessions"}
                className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#2A3039] bg-gradient-to-b from-[#171C24] to-[#13171D] px-6 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#1B2028]"
              >
                {isCoachOrAdmin ? "Manage Assignments" : "View Workout Sessions"}
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584]" />
                {isCoachOrAdmin
                  ? "Roster & Assignment Management"
                  : "Assigned Training Programs"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584]" />
                Live Set, Rep & Volume Tracking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#5BE584]" />
                Body Measurements & Insights
              </span>
            </div>
          </div>

          {/* Right Column: Product Preview */}
          <div className="relative w-full lg:col-span-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#5BE584]/12 via-transparent to-[#5BE584]/10 blur-2xl"
            />
            <HeroProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
};


