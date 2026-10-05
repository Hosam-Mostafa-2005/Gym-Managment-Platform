// src/features/landing/components/hero/HeroBadge.tsx
import React from "react";

interface HeroBadgeProps {
  text: string;
}

export const HeroBadge: React.FC<HeroBadgeProps> = ({ text }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16291d] border border-[#23422e] text-[#5BE584] text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm shadow-[0_0_15px_rgba(91,229,132,0.1)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] shadow-[0_0_8px_#5BE584] animate-pulse" />
      {text}
    </div>
  );
};
