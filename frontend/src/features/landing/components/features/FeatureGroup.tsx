// src/features/landing/components/features/FeatureGroup.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";

interface FeatureGroupProps {
  category: string;
  features: { name: string; icon: LucideIcon }[];
}

export const FeatureGroup: React.FC<FeatureGroupProps> = ({
  category,
  features,
}) => (
  <div className="flex flex-col gap-3.5 rounded-[20px] border border-[#2A3039] bg-[#13171D] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
    <h3 className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase border-b border-[#2A3039] pb-2.5">
      {category}
    </h3>
    <div className="flex flex-col gap-2.5">
      {features.map((feat, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-[14px] border border-[#2A3039] bg-[#090B0F] px-3.5 py-2.5 transition-colors hover:border-[#38414D]"
        >
          <feat.icon className="h-4 w-4 shrink-0 text-[#5BE584]" />
          <span className="text-sm font-medium text-[#F8FAFC]">{feat.name}</span>
        </div>
      ))}
    </div>
  </div>
);
