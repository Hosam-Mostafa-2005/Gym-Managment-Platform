import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Flame,
  ShieldCheck,
} from "lucide-react";
import heroImage from "@/assets/STREN.png";

const HERO_HIGHLIGHTS = [
  "Structured Workout Builder",
  "Coach & Member Assignments",
  "Live Set & Volume Logging",
];

export default function OverviewHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] bg-[radial-gradient(ellipse_at_top_right,rgba(91,229,132,0.09),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(91,229,132,0.05),transparent_45%)] text-[#F8FAFC] py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      {/* Faint radially-masked architectural grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(42,48,57,0.24)_1px,transparent_1px),linear-gradient(to_bottom,rgba(42,48,57,0.24)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_30%,transparent_100%)]"
      />

      {/* Softly blurred ambient orbs (respects prefers-reduced-motion) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/4 h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-[#5BE584]/[0.07] blur-[130px] motion-safe:animate-pulse [animation-duration:8s]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-24 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#5BE584]/[0.08] blur-[140px]"
      />

      {/* Restrained abstract geometric rings behind right visual column */}
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        fill="none"
        className="pointer-events-none absolute -right-28 top-1/2 hidden lg:block h-[640px] w-[640px] -translate-y-1/2 opacity-25"
      >
        <circle
          cx="300"
          cy="300"
          r="210"
          stroke="url(#strenHeroRing)"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
        <circle
          cx="300"
          cy="300"
          r="275"
          stroke="url(#strenHeroRing)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="strenHeroRing" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5BE584" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#2A3039" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#090B0F" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle bottom section glow divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/35 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: STREN Brand Identity, Headline & Public CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#5BE584]/35 bg-[#5BE584]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#5BE584] shadow-[0_0_24px_rgba(91,229,132,0.12)] mb-6">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>STREN · Athletic Training & Gym Platform</span>
            </div>

            <div className="mb-3 flex items-baseline gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.22em] text-[#94A3B8]">
                PLATFORM
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] shadow-[0_0_8px_#5BE584]" />
              <span className="text-xs font-mono uppercase tracking-[0.22em] text-[#5BE584]">
                STREN WORKSPACE
              </span>
            </div>

            <h1 className="font-bold tracking-[-0.03em] leading-[1.08] text-3xl sm:text-5xl lg:text-6xl text-[#F8FAFC]">
              Train with Structure.{" "}
              <span className="bg-gradient-to-r from-[#5BE584] via-[#7CF29C] to-[#49D472] bg-clip-text text-transparent">
                Coach with Precision.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm sm:text-base lg:text-lg text-[#94A3B8] leading-relaxed">
              STREN connects coaches and athletes in one performance
              workspace—combining workout programming, exercise libraries,
              assigned training plans, live session logging, and body
              measurement tracking.
            </p>

            {/* Primary & Secondary Public CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-7 text-sm font-semibold text-[#090B0F] shadow-[0_0_28px_rgba(91,229,132,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_38px_rgba(91,229,132,0.42)]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#2A3039] bg-gradient-to-b from-[#171C24] to-[#13171D] px-7 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#1B2028]"
              >
                Sign In
              </Link>
            </div>

            {/* Concise capability pills */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-6 border-t border-[#2A3039]/80 w-full">
              {HERO_HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#94A3B8]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5BE584]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Framed Dark Gym Visual */}
          <div className="lg:col-span-5 w-full relative">
            {/* Soft ambient halo behind visual card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-[#5BE584]/15 via-transparent to-[#5BE584]/10 blur-2xl"
            />

            <div className="relative overflow-hidden rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_36px_rgba(91,229,132,0.08)]">
              {/* Top specular border highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#5BE584]/55 to-transparent"
              />

              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/4.2] w-full overflow-hidden bg-[#090B0F]">
                <img
                  src={heroImage}
                  alt="STREN athletic strength training workspace"
                  className="h-full w-full object-cover object-center opacity-75 contrast-110 grayscale-[0.15]"
                />
                {/* Large STREN Wordmark */}
                <div className="absolute inset-x-0 top-[35%] z-10 flex justify-center px-3">
                  <h2 className="text-center text-5xl font-black tracking-[-0.06em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.85)] sm:text-7xl lg:text-8xl">
                    STREN
                  </h2>
                </div>
                {/* Balanced dark gradient overlays for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090B0F] via-[#090B0F]/45 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#090B0F]/50 via-transparent to-[#090B0F]/30" />

                {/* Top STREN Brand Badge inside visual frame */}
                <div className="absolute top-4 right-4 z-10 flex justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5BE584]/35 bg-[#090B0F]/85 px-3 py-1 text-[11px] font-semibold text-[#5BE584] shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md">
                    <Flame className="h-3.5 w-3.5" />
                    Built for Gym Performance
                  </span>
                </div>

                {/* Bottom Overlay Summary Card */}
                <div className="absolute bottom-4 left-4 right-4 z-10 rounded-[16px] border border-[#2A3039] bg-gradient-to-b from-[#171C24]/95 to-[#13171D]/95 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5BE584]">
                        Connected Training Flow
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
                        Program → Assign → Execute → Measure
                      </p>
                      <p className="mt-1 text-xs text-[#94A3B8]">
                        Every set, assignment, and measurement stays
                        synchronized between coaches and members.
                      </p>
                    </div>
                    <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#5BE584]/30 bg-[#5BE584]/10 text-[#5BE584] shadow-[0_0_16px_rgba(91,229,132,0.15)]">
                      <ShieldCheck className="h-4 w-4" />
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
}

