import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  Calendar,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { useActiveCoachingRelationship } from "../hooks/useActiveCoachingRelationship";
import { useUpdateHistoryConsent } from "../hooks/useUpdateHistoryConsent";
import { useTerminateRelationship } from "../hooks/useTerminateRelationship";
import { HistorySharingConsentDialog } from "./HistorySharingConsentDialog";

export const CoachingConsentCard: React.FC = () => {
  const { t } = useTranslation(["common"]);
  const { data: relationship, isLoading } = useActiveCoachingRelationship();
  const { mutate: updateConsent, isPending: isUpdatingConsent } =
    useUpdateHistoryConsent();
  const { mutate: terminateRel, isPending: isTerminating } =
    useTerminateRelationship();

  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-xs text-gray-500 rounded-xl border border-[#1E2329] bg-[#0D1014]">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#5BE584]" />
        {t("actions.loading", "Loading coaching status...")}
      </div>
    );
  }

  if (!relationship || !relationship.isActive) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-[#1E2329] bg-[#0D1014] p-5">
        <div className="flex items-center gap-2 text-gray-400">
          <UserCheck className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-bold text-gray-200">
            Coaching & History Privacy
          </h3>
        </div>
        <p className="text-xs text-gray-500">
          You are currently training independently. When a certified STREN coach sends you an invitation, you can accept it and control your historical workout privacy here.
        </p>
      </div>
    );
  }

  const coachName = relationship.trainer?.name || "your Coach";
  const isConsentGranted = relationship.historySharingConsent === "GRANTED";

  const handleRevokeConsent = () => {
    if (
      window.confirm(
        "Are you sure you want to revoke history sharing? Your coach will no longer have access to pre-coaching workouts and measurements.",
      )
    ) {
      updateConsent({
        id: relationship.id,
        payload: { consent: "REVOKED" },
      });
    }
  };

  const handleTerminateRelationship = () => {
    const promptMessage = t("coachConflict.confirmEndPromptOnly", {
      coachName,
      defaultValue: `Are you sure you want to end your coaching relationship with Coach ${coachName}? You will then be training independently.`,
    });

    if (window.confirm(promptMessage)) {
      terminateRel(undefined, {
        onSuccess: () => {
          toast.success(
            t("coachConflict.endedSuccess", {
              coachName,
              defaultValue: `Coaching relationship with Coach ${coachName} ended.`,
            }),
          );
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ||
              t("coachConflict.failed", "Failed to update coaching relationship."),
          );
        },
      });
    }
  };

  const formatStartedDate = (dateStr?: string | null) => {
    if (!dateStr) return "Recent";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E2329] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#23422e] bg-[#16291d] text-[#5BE584]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-100">
                  Active Coach: {relationship.trainer?.name || "Coach"}
                </h3>
                <span className="inline-flex items-center rounded bg-[#16291d] border border-[#23422e] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#5BE584]">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {relationship.trainer?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Coaching since {formatStartedDate(relationship.startedAt)}</span>
          </div>
        </div>

        {/* History Consent Status Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-[#1E2329] bg-[#101418] p-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                isConsentGranted
                  ? "border-[#5BE584]/30 bg-[#5BE584]/10 text-[#5BE584]"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              {isConsentGranted ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-200">
                  Pre-Coaching History Access:
                </span>
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                    isConsentGranted
                      ? "bg-[#16291d] text-[#5BE584] border-[#23422e]"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {isConsentGranted ? "Shared" : "Private"}
                </span>
              </div>
              <p className="text-xs text-gray-400 max-w-xl">
                {isConsentGranted
                  ? "Your coach can view past workout history and measurements (clearly labeled as pre-coach historical data). You can revoke access at any time."
                  : "Your pre-coaching workout and measurement logs are kept private. Your coach only sees logs recorded during this coaching relationship."}
              </p>
            </div>
          </div>

          {/* Privacy Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {isConsentGranted ? (
              <button
                type="button"
                onClick={handleRevokeConsent}
                disabled={isUpdatingConsent}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Lock className="h-3.5 w-3.5" />
                Revoke Access
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsConsentDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#5BE584] px-3.5 py-1.5 text-xs font-bold text-[#090B0F] hover:bg-[#4ade80] transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Share History
              </button>
            )}
          </div>
        </div>

        {/* Footer: End Relationship Option */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1E2329]/60 text-xs">
          <span className="text-gray-500">
            Need to end your personal training engagement?
          </span>
          <button
            type="button"
            onClick={handleTerminateRelationship}
            disabled={isTerminating}
            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors text-xs font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            End Coaching Relationship
          </button>
        </div>
      </div>

      {/* Consent Dialog */}
      {isConsentDialogOpen && (
        <HistorySharingConsentDialog
          isOpen={isConsentDialogOpen}
          onClose={() => setIsConsentDialogOpen(false)}
          relationshipId={relationship.id}
          coachName={relationship.trainer?.name || "your Coach"}
          initialConsent={relationship.historySharingConsent}
        />
      )}
    </>
  );
};
