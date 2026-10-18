// src/features/landing/components/ecosystem/ConnectedPlatform.tsx
import React from "react";
import { landingContent } from "../../data/landing-content";
import { EcosystemGraph } from "./EcosystemGraph";

export const ConnectedPlatform = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#2A3039] bg-[#090B0F] bg-[radial-gradient(ellipse_at_center,rgba(91,229,132,0.06),transparent_55%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      {/* Restrained abstract concentric rings behind EcosystemGraph */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 800"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[720px] w-[720px] opacity-20"
      >
        <circle
          cx="400"
          cy="400"
          r="260"
          stroke="url(#strenEcoRing)"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <circle
          cx="400"
          cy="400"
          r="350"
          stroke="url(#strenEcoRing)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="strenEcoRing" x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5BE584" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#2A3039" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#090B0F" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 mx-auto max-w-[1200px] flex flex-col items-center">
        <div className="text-center max-w-2xl flex flex-col items-center gap-3">
          <span className="inline-block rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
            Connected Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
            {landingContent.ecosystem.headline}
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            {landingContent.ecosystem.description}
          </p>
        </div>

        <EcosystemGraph />
      </div>
    </section>
  );
};

