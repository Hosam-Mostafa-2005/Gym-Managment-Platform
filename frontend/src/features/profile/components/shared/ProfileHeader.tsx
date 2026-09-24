// src/features/profile/components/shared/ProfileHeader.tsx
import React from "react";
import { ShieldCheck, MapPin } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileHeaderProps {
  name: string;
  role: string;
  email: string;
  isActive?: boolean;
  joinedDate?: string;
  location?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  role,
  isActive = true,
  joinedDate,
  location = "HQ Main Deck (Zone A)",
  subtitle,
  actions,
  children,
}) => {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-[#1e2329] bg-[#0d1014] p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <ProfileAvatar name={name} isActive={isActive} size="lg" />

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-gray-100">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded bg-[#16291d] border border-[#23422e] px-2 py-0.5 text-[10px] font-bold text-[#5BE584] uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" />
                {role}
              </span>
            </div>

            {subtitle && (
              <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isActive ? "Active Account" : "Inactive"}
              </span>
              {joinedDate && (
                <>
                  <span>•</span>
                  <span>Joined {joinedDate}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-500" />
                {location}
              </span>
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children && (
        <div className="border-t border-[#1e2329] pt-4">{children}</div>
      )}
    </div>
  );
};
