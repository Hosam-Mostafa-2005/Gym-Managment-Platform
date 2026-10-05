// src/features/landing/components/problem/ProblemSection.tsx
import React from "react";
import { landingContent } from "../../data/landing-content";
import { FragmentedWorkflow } from "./FragmentedWorkflow";

export const ProblemSection = () => {
  return (
    <section className="bg-[#0A0C10] py-32 px-6">
      <div className="mx-auto max-w-[1000px] flex flex-col items-center text-center gap-6">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          {landingContent.problem.headline}
        </h2>
        <p className="max-w-2xl text-base text-gray-400">
          {landingContent.problem.description}
        </p>

        <FragmentedWorkflow />
      </div>
    </section>
  );
};
