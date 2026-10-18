import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell } from "lucide-react";

export default function OverviewCTA() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#090B0F] text-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      {/* Ambient radial glow behind CTA card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[640px] rounded-full bg-[#5BE584]/[0.07] blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-8 sm:p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(91,229,132,0.06)]">
        {/* Top specular highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/55 to-transparent"
        />

        {/* Restrained abstract corner rings */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full border border-[#5BE584]/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full border border-[#5BE584]/15"
        />

        <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#5BE584] text-[#090B0F] shadow-[0_0_24px_rgba(91,229,132,0.35)]">
          <Dumbbell className="h-5 w-5" />
        </div>

        <h2 className="relative z-10 text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
          Start Training with STREN Today
        </h2>

        <p className="relative z-10 mt-3 max-w-xl text-sm sm:text-base text-[#94A3B8] leading-relaxed">
          Create your account to start tracking workouts, live training sessions, and
          body measurements—or sign in to access your existing workspace.
        </p>

        <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-7 text-sm font-semibold text-[#090B0F] shadow-[0_0_26px_rgba(91,229,132,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#49D472] hover:shadow-[0_0_36px_rgba(91,229,132,0.42)]"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#090B0F] px-7 text-sm font-semibold text-[#F8FAFC] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D] hover:bg-[#1B2028]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}


