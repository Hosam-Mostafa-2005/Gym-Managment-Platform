// src/features/landing/components/hero/HeroBadge.tsx
import React from "react";

interface HeroBadgeProps {
  text: string;
}

export const HeroBadge: React.FC<HeroBadgeProps> = ({ text }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584]" />
      {text}
    </div>
  );
};
