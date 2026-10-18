// src/features/landing/components/problem/ProblemSection.tsx
import React from "react";
import { landingContent } from "../../data/landing-content";
import { FragmentedWorkflow } from "./FragmentedWorkflow";

export const ProblemSection = () => {
  return (
    <section className="border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px] flex flex-col items-center text-center gap-5">
        <span className="inline-block rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#EF4444]">
          The Challenge
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
          {landingContent.problem.headline}
        </h2>
        <p className="max-w-2xl text-sm sm:text-base text-[#94A3B8]">
          {landingContent.problem.description}
        </p>

        <FragmentedWorkflow />
      </div>
    </section>
  );
};
