// src/features/landing/components/journeys/MemberJourney.tsx
import React from "react";
import { memberJourney } from "../../data/member-journey";
import { JourneyStep } from "./JourneyStep";

export const MemberJourney = () => {
  return (
    <div className="flex flex-col gap-6 w-full mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3039] pb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
            The Member Experience
          </h3>
          <span className="rounded-full border border-[#2A3039] bg-[#1B2028] px-2.5 py-0.5 text-[11px] font-semibold text-[#F8FAFC] uppercase tracking-wider">
            Training Execution
          </span>
        </div>
        <span className="text-xs text-[#94A3B8]">
          5 focused steps from assigned plan to completed session metrics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {memberJourney.map((data, idx) => (
          <JourneyStep key={idx} {...data} />
        ))}
      </div>
    </div>
  );
};
