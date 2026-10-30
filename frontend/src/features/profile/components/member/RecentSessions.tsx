// src/features/profile/components/member/RecentSessions.tsx
import React from "react";
import { Activity, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileSection } from "../shared/ProfileSection";
import type { MemberSession } from "../../types/profile.types";

interface RecentSessionsProps {
  sessions: MemberSession[];
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({
  sessions = [],
}) => {
  const { t, i18n } = useTranslation(["profile"]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <ProfileSection
      title={t("member.recentSessions.title")}
      subtitle={t("member.recentSessions.subtitle")}
      icon={Activity}
    >
      {sessions?.length > 0 ? (
        <div className="divide-y divide-[#1e2329] text-xs">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-gray-200">
                  {session.workout?.title || t("member.recentSessions.independentSession")}
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(session.startedAt)}
                  {session.duration
                    ? ` • ${t("member.recentSessions.duration", { count: session.duration })}`
                    : ""}
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                {session.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          {t("member.recentSessions.empty")}
        </div>
      )}
    </ProfileSection>
  );
};

export default RecentSessions;
