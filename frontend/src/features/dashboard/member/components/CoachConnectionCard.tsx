// src/features/dashboard/member/components/CoachConnectionCard.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  UserCheck,
  Shield,
  Lock,
  Unlock,
  User,
  Award,
  BookOpen,
  Briefcase,
  X,
  ExternalLink,
} from "lucide-react";
import type { CoachConnection } from "../../types/dashboard.types";

interface CoachConnectionCardProps {
  coachConnection?: CoachConnection;
}

export const CoachConnectionCard: React.FC<CoachConnectionCardProps> = ({
  coachConnection,
}) => {
  const { t, i18n } = useTranslation(["dashboard"]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const hasCoach = Boolean(
    coachConnection?.hasActiveCoach && coachConnection?.coach,
  );
  const coach = coachConnection?.coach;
  const consent = coachConnection?.historySharingConsent;

  const currentLang = i18n.language === "ar" ? "ar-EG" : "en-US";

  const getConsentBadge = (status?: string | null) => {
    switch (status) {
      case "GRANTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <Unlock className="h-3 w-3" />
            <span>{t("member.coachConnection.historyShared")}</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
            <Shield className="h-3 w-3" />
            <span>{t("member.coachConnection.consentPending")}</span>
          </span>
        );
      case "DECLINED":
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
            <Lock className="h-3 w-3" />
            <span>{t("member.coachConnection.historyPrivate")}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-400">
            {t("member.coachConnection.noConsentSet")}
          </span>
        );
    }
  };

  return (
    <>
      <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {t("member.coachConnection.title")}
              </h2>
              <p className="text-xs text-gray-400">
                {t("member.coachConnection.subtitle")}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
              hasCoach
                ? "bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/20"
                : "bg-gray-800 text-gray-400 border border-gray-700"
            }`}
          >
            {hasCoach
              ? t("member.coachConnection.statusActive")
              : t("member.coachConnection.statusIndependent")}
          </span>
        </div>

        {/* Body */}
        <div className="mt-4">
          {hasCoach && coach ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E2329] text-gray-300 font-bold border border-[#2A313C] overflow-hidden">
                    {coach.avatarUrl ? (
                      <img
                        src={coach.avatarUrl}
                        alt={coach.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {coach.name}
                    </h3>
                    {coach.professionalTitle ? (
                      <p className="text-xs text-[#5BE584] font-medium truncate">
                        {coach.professionalTitle}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 truncate">
                        {coach.email}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#1E2329] bg-[#161B22] px-2.5 py-1 text-xs font-medium text-[#9CA3AF] hover:border-[#5BE584]/40 hover:text-white transition-colors"
                >
                  <span>{t("member.coachConnection.viewProfile")}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1E2329] bg-[#161B22] p-3 text-xs">
                <span className="text-gray-400">
                  {t("member.coachConnection.historicalProgressSharing")}
                </span>
                {getConsentBadge(consent)}
              </div>

              {coachConnection?.startedAt && (
                <p className="text-[11px] text-gray-500">
                  {t("member.coachConnection.coachingStartedOn", {
                    date: new Date(coachConnection.startedAt).toLocaleDateString(
                      currentLang,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ),
                  })}
                </p>
              )}
            </div>
          ) : (
            /* Independent Training State */
            <div className="flex items-center gap-3 rounded-lg border border-[#1E2329] bg-[#161B22]/50 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E2329] text-gray-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  {t("member.coachConnection.trainingIndependently")}
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t("member.coachConnection.trainingIndependentlyDesc")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coach Profile Details Modal */}
      {showProfileModal &&
        coach &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1E2329]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584] overflow-hidden">
                      {coach.avatarUrl ? (
                        <img
                          src={coach.avatarUrl}
                          alt={coach.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-[#5BE584]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {coach.name}
                      </h3>
                      <p className="text-xs text-[#5BE584] font-medium">
                        {coach.professionalTitle ||
                          t("member.coachConnection.certifiedCoach")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 text-sm">
                  {/* Experience & Contact */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-[#1E2329] bg-[#101418]">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-4 w-4 text-[#5BE584] shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">
                          {t("member.coachConnection.experience")}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {coach.yearsOfExperience != null
                            ? t("member.coachConnection.yearsExperience", {
                                count: coach.yearsOfExperience,
                              })
                            : t("member.coachConnection.professional")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-l rtl:border-l-0 rtl:border-r border-[#1E2329] pl-3 rtl:pl-0 rtl:pr-3">
                      <UserCheck className="h-4 w-4 text-[#5BE584] shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block">
                          {t("member.coachConnection.status")}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {t("member.coachConnection.activeCoach")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  {coach.specialties && coach.specialties.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                        {t("member.coachConnection.specialties")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {coach.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="inline-flex items-center rounded-lg border border-[#5BE584]/20 bg-[#5BE584]/10 px-2.5 py-1 text-xs font-medium text-[#5BE584]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {coach.certifications && coach.certifications.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        <Award className="h-3.5 w-3.5 text-[#5BE584]" />
                        <span>{t("member.coachConnection.credentials")}</span>
                      </div>
                      <div className="space-y-1.5">
                        {coach.certifications.map((cert) => (
                          <div
                            key={cert}
                            className="flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-2 text-xs text-[#E5E7EB]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584]" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coaching Philosophy */}
                  {coach.coachingPhilosophy && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        <BookOpen className="h-3.5 w-3.5 text-[#5BE584]" />
                        <span>{t("member.coachConnection.philosophy")}</span>
                      </div>
                      <blockquote className="rounded-xl border border-[#23422E] bg-[#16291D]/40 p-3.5 text-xs text-emerald-200/90 italic leading-relaxed">
                        "{coach.coachingPhilosophy}"
                      </blockquote>
                    </div>
                  )}

                  {/* Bio */}
                  {coach.bio && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] block">
                        {t("member.coachConnection.about")}
                      </span>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        {coach.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end p-4 border-t border-[#1E2329] bg-[#101418]/50">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 text-xs font-medium rounded-xl border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
                  >
                    {t("member.coachConnection.close")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
