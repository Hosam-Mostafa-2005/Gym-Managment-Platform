// src/features/member-profile/components/shared/CoachingRelationshipHeaderBanner.tsx
import React from "react";
import { ShieldCheck, Lock, Clock, UserCheck, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CoachingRelationshipInfo } from "../../types/member-profile.types";

interface CoachingRelationshipHeaderBannerProps {
  relationship?: CoachingRelationshipInfo | null;
}

export const CoachingRelationshipHeaderBanner: React.FC<
  CoachingRelationshipHeaderBannerProps
> = ({ relationship }) => {
  const { t, i18n } = useTranslation(["profile"]);

  if (!relationship) return null;

  const isConsentGranted = relationship.historySharingConsent === "GRANTED";
  const isConsentPending = relationship.historySharingConsent === "PENDING";

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
    <div className="flex flex-col gap-3 rounded-xl border border-[#1E2329] bg-[#0D1014] p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E2329] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#23422e] bg-[#16291d] text-[#5BE584]">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-200">
              {t("rosterMemberView.coachingBanner.title")}
            </span>
            <span className="text-[10px] text-gray-500 block">
              {t("rosterMemberView.coachingBanner.subtitle")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {relationship.startedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span>
                {t("rosterMemberView.coachingBanner.since", {
                  date: formatDate(relationship.startedAt),
                })}
              </span>
            </div>
          )}

          {isConsentGranted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16291d] border border-[#23422e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5BE584]">
              <ShieldCheck className="h-3 w-3" />
              {t("rosterMemberView.coachingBanner.accessGranted")}
            </span>
          ) : isConsentPending ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <Clock className="h-3 w-3" />
              {t("rosterMemberView.coachingBanner.accessPending")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 border border-gray-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Lock className="h-3 w-3" />
              {t("rosterMemberView.coachingBanner.accessNotGranted")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachingRelationshipHeaderBanner;
