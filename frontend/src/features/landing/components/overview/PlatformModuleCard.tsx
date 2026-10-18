// src/features/landing/components/overview/PlatformModuleCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PlatformModuleCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  href?: string;
}

export const PlatformModuleCard: React.FC<PlatformModuleCardProps> = ({
  title,
  icon: Icon,
  description,
  href,
}) => {
  const content = (
    <>
      {/* Top specular hairline on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/50 to-transparent opacity-35 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#090B0F] text-[#5BE584] transition-all duration-300 group-hover:border-[#5BE584]/45 group-hover:bg-[#5BE584]/10 group-hover:shadow-[0_0_18px_rgba(91,229,132,0.18)]">
          <Icon className="h-5 w-5" />
        </div>
        {href && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-transparent text-[#94A3B8] transition-all duration-300 group-hover:border-[#5BE584]/30 group-hover:bg-[#090B0F] group-hover:text-[#5BE584]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1 group-hover:text-[#5BE584] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="group relative flex flex-col gap-3.5 overflow-hidden rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#5BE584]/40 hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.65),0_0_26px_rgba(91,229,132,0.08)]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="group relative flex flex-col gap-3.5 overflow-hidden rounded-[20px] border border-[#2A3039] bg-gradient-to-b from-[#161B23] to-[#13171D] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#38414D]">
      {content}
    </div>
  );
};


