// src/features/landing/components/showcase/ProductPreview.tsx
import React from "react";

export const ProductPreview: React.FC<{ activeTab: string }> = ({
  activeTab,
}) => {
  // Simple abstraction of the actual UI based on active tab
  return (
    <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-xl border border-[#1E2329] bg-[#0D1117] shadow-2xl overflow-hidden flex flex-col">
      {/* App Window Header */}
      <div className="flex h-12 items-center border-b border-[#1E2329] bg-[#090B0F] px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-[#1E2329]" />
          <div className="h-3 w-3 rounded-full bg-[#1E2329]" />
          <div className="h-3 w-3 rounded-full bg-[#1E2329]" />
        </div>
        <div className="mx-auto flex h-6 items-center rounded border border-[#1E2329] bg-[#0D1117] px-6 text-[10px] font-mono text-gray-500">
          stren.os / {activeTab}
        </div>
      </div>

      {/* App Body Placeholder - using CSS grid/patterns to represent UI density */}
      <div className="flex-1 bg-[url('/noise.svg')] bg-[#0A0C10] p-6 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.4)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

        <div className="relative z-10 h-full w-full border border-[#1E2329]/50 bg-[#0D1117]/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#5BE584] animate-pulse">●</span>
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
              {activeTab.replace("-", " ")} Module
            </p>
            <p className="text-[10px] text-gray-500 font-mono">
              Live Interactive UI Representation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
