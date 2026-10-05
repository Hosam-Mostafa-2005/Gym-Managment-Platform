// src/features/landing/components/overview/PlatformModuleCard.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";

interface PlatformModuleCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
}

export const PlatformModuleCard: React.FC<PlatformModuleCardProps> = ({
  title,
  icon: Icon,
  description,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1E2329] bg-[#0D1117] p-5 transition-colors hover:border-[#5BE584]/40 hover:bg-[#1E2329]/50 group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#090B0F] border border-[#1E2329] text-[#5BE584] transition-colors group-hover:bg-[#16291d] group-hover:border-[#23422e]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
