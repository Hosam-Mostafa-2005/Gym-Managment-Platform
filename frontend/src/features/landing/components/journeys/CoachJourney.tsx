// src/features/landing/components/journeys/CoachJourney.tsx
import React from "react";
import { coachJourney } from "../../data/coach-journey";
import { JourneyStep } from "./JourneyStep";

export const CoachJourney = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3039] pb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
            The Coach Workflow
          </h3>
          <span className="rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#5BE584] uppercase tracking-wider">
            Programming & Oversight
          </span>
        </div>
        <span className="text-xs text-[#94A3B8]">
          6 sequential stages from exercise creation to performance review
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {coachJourney.map((data, idx) => (
          <JourneyStep key={idx} {...data} />
        ))}
      </div>
    </div>
  );
};
