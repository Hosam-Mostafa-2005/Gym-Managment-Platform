// src/features/landing/components/journeys/JourneyTimeline.tsx
import React from "react";
import { CoachJourney } from "./CoachJourney";
import { MemberJourney } from "./MemberJourney";

export const JourneyTimeline = () => {
  return (
    <section className="bg-[#0A0C10] py-32 px-6 border-t border-[#1E2329]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-20 text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            End-to-End Execution.
          </h2>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base">
            From the moment a periodized block is programmed to the final drop
            of sweat. See how information flows sequentially across the entire
            platform.
          </p>
        </div>

        <CoachJourney />
        <MemberJourney />
      </div>
    </section>
  );
};
