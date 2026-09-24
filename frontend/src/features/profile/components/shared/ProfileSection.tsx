// src/features/profile/components/shared/ProfileSection.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";

interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-6 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#1e2329] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 text-gray-400" />}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
            {subtitle && (
              <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {children}
    </div>
  );
};
