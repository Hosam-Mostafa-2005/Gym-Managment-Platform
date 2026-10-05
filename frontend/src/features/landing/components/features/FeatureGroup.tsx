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
  <div className="flex flex-col gap-4">
    <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase border-b border-[#1E2329] pb-2">
      {category}
    </h3>
    <div className="flex flex-col gap-3">
      {features.map((feat, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-lg border border-[#1E2329] bg-[#0D1117] p-3 transition-colors hover:border-[#5BE584]/30"
        >
          <feat.icon className="h-4 w-4 text-[#5BE584]" />
          <span className="text-sm font-medium text-gray-200">{feat.name}</span>
        </div>
      ))}
    </div>
  </div>
);
