// src/features/member-profile/components/shared/ProfileStatCard.tsx

import React from "react";

interface ProfileStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
}

export const ProfileStatCard: React.FC<ProfileStatCardProps> = ({
  label,
  value,
  icon,
  description,
}) => {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4 transition-colors hover:border-[#2A313A]">
      <div className="flex items-center gap-2 text-gray-400">
        {icon && <span className="h-4 w-4">{icon}</span>}
        <span className="text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-100">{value}</span>
        {description && (
          <span className="text-xs font-medium text-gray-500">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
