// src/features/landing/components/journeys/JourneyStep.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";

interface JourneyStepProps {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const JourneyStep: React.FC<JourneyStepProps> = ({
  step,
  title,
  description,
  icon: Icon,
}) => (
  <div className="relative flex flex-col gap-4 group">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#1E2329] bg-[#0D1117] text-gray-500 transition-colors group-hover:border-[#5BE584] group-hover:text-[#5BE584] z-10 relative">
      <Icon className="h-6 w-6" />
      <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded bg-[#1E2329] text-[10px] font-bold text-white group-hover:bg-[#5BE584] group-hover:text-[#090B0F]">
        {step}
      </div>
    </div>
    <div className="flex flex-col gap-1 pr-4">
      <h4 className="text-sm font-bold text-gray-200">{title}</h4>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
);
