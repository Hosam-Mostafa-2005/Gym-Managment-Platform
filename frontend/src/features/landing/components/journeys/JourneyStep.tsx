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
  <div className="flex flex-col justify-between gap-4 rounded-[20px] border border-[#2A3039] bg-[#13171D] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-colors hover:border-[#38414D]">
    <div className="flex items-center justify-between">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#090B0F] text-[#5BE584]">
        <Icon className="h-5 w-5" />
      </div>
      <span className="rounded-[10px] border border-[#2A3039] bg-[#090B0F] px-2.5 py-1 text-xs font-bold text-[#94A3B8]">
        {step}
      </span>
    </div>
    <div className="flex flex-col gap-1">
      <h4 className="text-sm font-semibold text-[#F8FAFC]">{title}</h4>
      <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
    </div>
  </div>
);
