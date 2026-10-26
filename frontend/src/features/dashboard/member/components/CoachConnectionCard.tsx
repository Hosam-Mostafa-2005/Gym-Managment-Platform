// src/features/dashboard/member/components/CoachConnectionCard.tsx
import React from "react";
import { UserCheck, Shield, Lock, Unlock, User } from "lucide-react";
import type { CoachConnection } from "../../types/dashboard.types";

interface CoachConnectionCardProps {
  coachConnection?: CoachConnection;
}

export const CoachConnectionCard: React.FC<CoachConnectionCardProps> = ({
  coachConnection,
}) => {
  const hasCoach = Boolean(coachConnection?.hasActiveCoach && coachConnection?.coach);
  const coach = coachConnection?.coach;
  const consent = coachConnection?.historySharingConsent;

  const getConsentBadge = (status?: string | null) => {
    switch (status) {
      case "GRANTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <Unlock className="h-3 w-3" /> History Shared
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
            <Shield className="h-3 w-3" /> Consent Pending
          </span>
        );
      case "DECLINED":
      case "REVOKED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
            <Lock className="h-3 w-3" /> History Private
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-400">
            No Consent Set
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Coach Connection</h2>
            <p className="text-xs text-gray-400">
              Your professional coaching relationship
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
          {hasCoach ? "Active" : "Independent"}
        </span>
      </div>

      {/* Body */}
      <div className="mt-4">
        {hasCoach && coach ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E2329] text-gray-300 font-bold border border-[#2A313C]">
                {coach.avatarUrl ? (
                  <img
                    src={coach.avatarUrl}
                    alt={coach.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {coach.name}
                </h3>
                <p className="text-xs text-gray-400 truncate">{coach.email}</p>
              </div>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1E2329] bg-[#161B22] p-3 text-xs">
              <span className="text-gray-400">Historical Progress Sharing:</span>
              {getConsentBadge(consent)}
            </div>

            {coachConnection?.startedAt && (
              <p className="text-[11px] text-gray-500">
                Coaching started on{" "}
                {new Date(coachConnection.startedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
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
                Training Independently
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                You are currently following your personal routine. When a coach invites you, you will be able to review their invitation here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
