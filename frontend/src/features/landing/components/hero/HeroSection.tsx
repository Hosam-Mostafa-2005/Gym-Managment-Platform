// src/features/landing/components/hero/HeroSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { HeroBadge } from "./HeroBadge";
import { HeroProductPreview } from "./HeroProductPreview";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#1E2329] pt-8 pb-16 md:pt-10 md:pb-24 lg:pt-12 lg:pb-32">
      {" "}
      {/* Background Grids */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#1E2329 1px, transparent 1px), linear-gradient(90deg, #1E2329 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.08)_0%,_rgba(9,11,15,0)_70%)] opacity-60 pointer-events-none blur-3xl" />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Copy & CTA */}
          <div className="flex flex-col items-start gap-6">
            <HeroBadge text="Gym Operations Engine" />

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.1]">
              One connected platform for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BE584] to-emerald-600">
                your gym.
              </span>
            </h1>

            <p className="max-w-xl text-lg text-gray-400">
              Manage training, members, workouts, and progress in one unified
              system. Escape fragmented workflows and build a premium athletic
              experience.
            </p>

            <div className="mt-4 flex flex-col w-full sm:w-auto sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#5BE584] px-8 text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#4ADE80] hover:scale-[1.02]"
              >
                Get Started <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#platform"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#1E2329] bg-[#0D1117] px-8 text-sm font-medium text-gray-200 transition-colors hover:bg-[#1E2329] hover:text-white"
              >
                Explore Platform
              </a>
            </div>
          </div>

          {/* Right Column: Product Preview */}
          <div className="w-full">
            <HeroProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
};
