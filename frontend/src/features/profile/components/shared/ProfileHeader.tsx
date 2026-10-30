// src/features/profile/components/shared/ProfileHeader.tsx
import React, { useState } from "react";
import { ShieldCheck, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileAvatar } from "./ProfileAvatar";
import { AvatarUploadDialog } from "./AvatarUploadDialog";

interface ProfileHeaderProps {
  name: string;
  role: string;
  email: string;
  image?: string | null;
  isActive?: boolean;
  joinedDate?: string;
  location?: string;
  subtitle?: string;
  editable?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  role,
  email,
  image,
  isActive = true,
  joinedDate,
  location,
  subtitle,
  editable = true,
  actions,
  children,
}) => {
  const { t } = useTranslation(["profile", "common"]);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const displayLocation = location || t("header.defaultLocation");

  const getRoleDisplay = (r: string) => {
    const upper = r?.toUpperCase();
    if (upper === "MEMBER") return t("roles.member", { ns: "common", defaultValue: "Member" });
    if (upper === "TRAINER" || upper === "COACH") return t("roles.coach", { ns: "common", defaultValue: "Coach" });
    if (upper === "ADMIN") return t("roles.admin", { ns: "common", defaultValue: "Admin" });
    return r;
  };

  return (
    <>
      <div className="flex flex-col gap-6 rounded-lg border border-[#1e2329] bg-[#0d1014] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <ProfileAvatar
              name={name}
              image={image}
              isActive={isActive}
              size="lg"
              editable={editable}
              onEdit={() => setIsAvatarDialogOpen(true)}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-gray-100">
                  {name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded bg-[#16291d] border border-[#23422e] px-2 py-0.5 text-[10px] font-bold text-[#5BE584] uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" />
                  {getRoleDisplay(role)}
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
                  {isActive ? t("header.activeAccount") : t("header.inactive")}
                </span>
                {joinedDate && (
                  <>
                    <span>•</span>
                    <span>{t("header.joinedDate", { date: joinedDate })}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  {displayLocation}
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

      <AvatarUploadDialog
        isOpen={isAvatarDialogOpen}
        onClose={() => setIsAvatarDialogOpen(false)}
        currentAvatarUrl={image}
        userName={name}
      />
    </>
  );
};

export default ProfileHeader;
