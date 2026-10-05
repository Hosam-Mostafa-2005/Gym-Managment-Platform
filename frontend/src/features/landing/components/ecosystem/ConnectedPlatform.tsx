// src/features/landing/components/ecosystem/ConnectedPlatform.tsx
import React from "react";
import { landingContent } from "../../data/landing-content";
import { EcosystemGraph } from "./EcosystemGraph";

export const ConnectedPlatform = () => {
  return (
    <section className="relative overflow-hidden border-t border-[#1E2329] bg-[#090B0F] py-32 px-6">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1200px] flex flex-col items-center">
        <div className="text-center max-w-2xl flex flex-col items-center gap-4">
          <span className="inline-block rounded-full border border-[#5BE584]/20 bg-[#5BE584]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5BE584]">
            The Solution
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            {landingContent.ecosystem.headline}
          </h2>
          <p className="text-base text-gray-400">
            {landingContent.ecosystem.description}
          </p>
        </div>

        <EcosystemGraph />
      </div>
    </section>
  );
};
