// src/features/member-profile/components/shared/MemberProfileHeader.tsx
import React from "react";
import { BarChart3, Ruler, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatMemberDisplay } from "@/features/users/utils/user-display";
import type { MemberProfileUser } from "../../types/member-profile.types";

interface MemberProfileHeaderProps {
  member: MemberProfileUser;
}

export const MemberProfileHeader: React.FC<MemberProfileHeaderProps> = ({
  member,
}) => {
  const { t, i18n } = useTranslation(["profile", "common"]);
  const navigate = useNavigate();
  const display = formatMemberDisplay(member);

  const formattedDate = new Intl.DateTimeFormat(
    i18n.language === "ar" ? "ar-EG" : "en-US",
    {
      month: "short",
      year: "numeric",
    },
  ).format(new Date(member.createdAt));

  const roleDisplay =
    member.role?.toUpperCase() === "MEMBER"
      ? t("roles.member", { ns: "common", defaultValue: "Member" })
      : member.role;

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-[#1E2329] bg-[#0D1117] p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
      {/* Member Info */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#5BE584] bg-[#1E2329] text-lg font-bold text-[#5BE584] md:h-16 md:w-16 md:text-xl">
          {display.avatarInitials}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold text-gray-100 md:text-2xl">
              {display.displayName}
            </h1>

            <span className="rounded-md bg-[#1E2329] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {roleDisplay}
            </span>

            {display.isTestAccount && (
              <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-mono text-amber-400">
                {t("header.actions.demoAccount")}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span className="truncate">{display.displayEmail}</span>

            <span className="hidden md:inline">•</span>

            <span>{t("header.memberSince", { date: formattedDate })}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Manage Member Plan */}
        <button
          type="button"
          onClick={() => navigate(`/members/${member.id}/plan`)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#5BE584] bg-[#5BE584] px-4 text-sm font-bold text-black shadow-lg shadow-[#5BE584]/20 transition-all hover:bg-[#4dd375] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Layers className="h-4 w-4 shrink-0" />
          <span>{t("header.actions.managePlan")}</span>
        </button>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          {/* View Insights */}
          <button
            type="button"
            onClick={() => navigate(`/members/${member.id}/insights`)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 text-sm font-medium text-[#5BE584] transition-all hover:border-[#5BE584]/60 hover:bg-[#5BE584]/15 active:scale-[0.98]"
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span>{t("header.actions.insights")}</span>
          </button>

          {/* View Measurements */}
          <button
            type="button"
            onClick={() => navigate(`/members/${member.id}/measurements`)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#2A3139] bg-[#151A20] px-3 text-sm font-medium text-gray-300 transition-all hover:border-[#5BE584]/40 hover:bg-[#1A2128] hover:text-gray-100 active:scale-[0.98]"
          >
            <Ruler className="h-4 w-4 shrink-0" />
            <span>{t("header.actions.measurements")}</span>
          </button>
        </div>

        {/* Active Status */}
        {member.isActive ? (
          <span className="inline-flex h-10 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 px-3 text-sm font-medium text-green-400">
            <span className="mr-2 rtl:mr-0 rtl:ml-2 h-2 w-2 rounded-full bg-green-500" />
            {t("rosterMemberView.active")}
          </span>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-700 bg-[#1E2329] px-3 text-sm font-medium text-gray-400">
            <span className="mr-2 rtl:mr-0 rtl:ml-2 h-2 w-2 rounded-full bg-gray-500" />
            {t("rosterMemberView.inactive")}
          </span>
        )}
      </div>
    </div>
  );
};

export default MemberProfileHeader;
