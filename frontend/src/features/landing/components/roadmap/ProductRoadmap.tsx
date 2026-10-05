// src/features/landing/components/roadmap/ProductRoadmap.tsx
import React from "react";
import { roadmapData } from "../../data/roadmap";
import { CheckCircle2, CircleDashed } from "lucide-react";

export const ProductRoadmap = () => {
  return (
    <section className="border-t border-[#1E2329] bg-[#0A0C10] py-32 px-6">
      <div className="mx-auto max-w-[1000px] flex flex-col gap-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Platform Roadmap
          </h2>
          <p className="text-sm text-gray-400">
            What we've built, and where we're going next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5BE584]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5BE584] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5BE584]"></span>
              </span>
              Available Now
            </h3>
            <div className="flex flex-col gap-3">
              {roadmapData.now.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded bg-[#0D1117] border border-[#1E2329] p-3 text-sm text-gray-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#5BE584]" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <CircleDashed className="h-3 w-3" /> Coming Next
            </h3>
            <div className="flex flex-col gap-3">
              {roadmapData.next.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded bg-[#090B0F] border border-[#1E2329] border-dashed p-3 text-sm text-gray-500"
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
