// src/features/landing/components/journeys/CoachJourney.tsx
import React from "react";
import { coachJourney } from "../../data/coach-journey";
import { JourneyStep } from "./JourneyStep";

export const CoachJourney = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center gap-4 border-b border-[#1E2329] pb-4">
        <h3 className="text-xl font-bold text-white">The Coach Workflow</h3>
        <span className="rounded bg-[#1E2329] px-2 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Programming
        </span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
        <div className="hidden lg:block absolute top-7 left-0 w-full h-px bg-[#1E2329] -z-0" />
        <div className="lg:hidden absolute left-7 top-0 w-px h-full bg-[#1E2329] -z-0" />

        {coachJourney.map((data, idx) => (
          <div key={idx} className="relative z-10 lg:pt-0 pl-16 lg:pl-0">
            <div className="absolute left-0 top-0 lg:static">
              <JourneyStep {...data} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
