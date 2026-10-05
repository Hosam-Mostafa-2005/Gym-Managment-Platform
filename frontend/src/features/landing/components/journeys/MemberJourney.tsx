// src/features/landing/components/journeys/MemberJourney.tsx
import React from "react";
import { memberJourney } from "../../data/member-journey";
import { JourneyStep } from "./JourneyStep";

export const MemberJourney = () => {
  return (
    <div className="flex flex-col gap-8 w-full mt-24">
      <div className="flex items-center gap-4 border-b border-[#1E2329] pb-4">
        <h3 className="text-xl font-bold text-white">The Member Experience</h3>
        <span className="rounded bg-[#1E2329] px-2 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Execution
        </span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        <div className="hidden md:block absolute top-7 left-0 w-full h-px bg-[#1E2329] -z-0" />
        <div className="md:hidden absolute left-7 top-0 w-px h-full bg-[#1E2329] -z-0" />

        {memberJourney.map((data, idx) => (
          <div key={idx} className="relative z-10 md:pt-0 pl-16 md:pl-0">
            <div className="absolute left-0 top-0 md:static">
              <JourneyStep {...data} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
