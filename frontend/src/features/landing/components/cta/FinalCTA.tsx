// src/features/landing/components/cta/FinalCTA.tsx
import React from "react";
import { Link } from "react-router-dom";
import { landingContent } from "../../data/landing-content";
import { ChevronRight } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden bg-[#090B0F] py-32 px-6 border-t border-[#1E2329]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-radial-glow opacity-60 pointer-events-none blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[800px] rounded-3xl border border-[#1E2329] bg-[#0D1117]/80 p-12 md:p-16 text-center shadow-2xl backdrop-blur-xl">
        <h2 className="mb-6 text-3xl md:text-5xl font-bold tracking-tight text-white">
          {landingContent.cta.headline}
        </h2>
        <p className="mb-10 text-sm md:text-base text-gray-400 max-w-lg mx-auto">
          {landingContent.cta.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#5BE584] px-8 text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#4ADE80] hover:scale-[1.02]"
          >
            {landingContent.cta.primaryCta} <ChevronRight className="h-4 w-4" />
          </Link>
          <a
            href="#"
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-[#1E2329] bg-[#090B0F] px-8 text-sm font-medium text-gray-200 transition-colors hover:bg-[#1E2329] hover:text-white"
          >
            {landingContent.cta.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
};
