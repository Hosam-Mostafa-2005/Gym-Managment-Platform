// src/features/landing/components/roadmap/ProductRoadmap.tsx
import React from "react";
import { roadmapData } from "../../data/roadmap";
import { CheckCircle2, CircleDashed } from "lucide-react";

export const ProductRoadmap = () => {
  return (
    <section
      id="roadmap"
      className="border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1040px] flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-[-0.02em]">
            Platform Roadmap
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Verified capabilities available now and planned platform milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="flex flex-col gap-4 rounded-[20px] border border-[#2A3039] bg-[#13171D] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5BE584]">
              <span className="h-2 w-2 rounded-full bg-[#5BE584]" />
              Available Now
            </h3>
            <div className="flex flex-col gap-2.5">
              {roadmapData.now.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[14px] bg-[#090B0F] border border-[#2A3039] px-3.5 py-2.5 text-sm text-[#F8FAFC]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5BE584]" />{" "}
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[20px] border border-[#2A3039] bg-[#13171D] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              <CircleDashed className="h-3.5 w-3.5" /> Planned Next
            </h3>
            <div className="flex flex-col gap-2.5">
              {roadmapData.next.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-[14px] bg-[#090B0F] border border-[#2A3039] border-dashed px-3.5 py-2.5 text-sm text-[#94A3B8]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
