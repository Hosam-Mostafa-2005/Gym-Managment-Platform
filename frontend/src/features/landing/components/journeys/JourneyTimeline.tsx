// src/features/landing/components/journeys/JourneyTimeline.tsx
import React from "react";
import { CoachJourney } from "./CoachJourney";
import { MemberJourney } from "./MemberJourney";

export const JourneyTimeline = () => {
  return (
    <section
      id="workflows"
      className="border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 text-center flex flex-col items-center">
          <span className="inline-block rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] mb-3">
            Role-Specific Workflows
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            Coach & Member Experiences.
          </h2>
          <p className="text-[#94A3B8] max-w-2xl text-sm sm:text-base">
            From programming a training block to logging the final working set,
            STREN structures every step for both coaches and athletes.
          </p>
        </div>

        <CoachJourney />
        <MemberJourney />
      </div>
    </section>
  );
};
