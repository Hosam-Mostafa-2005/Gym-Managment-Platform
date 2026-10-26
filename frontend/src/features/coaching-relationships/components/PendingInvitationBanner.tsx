import React, { useState } from "react";
import { UserCheck, Check, X, Loader2, Sparkles } from "lucide-react";
import { useMemberInvitations } from "../hooks/useMemberInvitations";
import { useRespondInvitation } from "../hooks/useRespondInvitation";
import { HistorySharingConsentDialog } from "./HistorySharingConsentDialog";
import type { CoachingRelationship } from "../types/coaching-relationships.types";

export const PendingInvitationBanner: React.FC = () => {
  const { data: invitations, isLoading } = useMemberInvitations();
  const { mutate: respond, isPending } = useRespondInvitation();

  const [activeConsentRelationship, setActiveConsentRelationship] =
    useState<CoachingRelationship | null>(null);

  if (isLoading) return null;

  const pendingInvitations = (invitations || []).filter(
    (inv) => inv.status === "PENDING" && inv.isActive,
  );

  if (pendingInvitations.length === 0) return null;

  const handleAccept = (inv: CoachingRelationship) => {
    respond(
      {
        id: inv.id,
        payload: { action: "ACCEPT" },
      },
      {
        onSuccess: (updatedRelationship) => {
          // Open history consent modal immediately after acceptance
          setActiveConsentRelationship(updatedRelationship);
        },
      },
    );
  };

  const handleDecline = (inv: CoachingRelationship) => {
    if (
      window.confirm(
        `Are you sure you want to decline the coaching invitation from ${inv.trainer?.name || "this coach"}?`,
      )
    ) {
      respond({
        id: inv.id,
        payload: { action: "DECLINE" },
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        {pendingInvitations.map((inv) => (
          <div
            key={inv.id}
            className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-[#5BE584]/40 bg-gradient-to-r from-[#16291d] via-[#101913] to-[#0D1014] p-4 shadow-lg animate-in fade-in"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#5BE584]/50 bg-[#5BE584]/15 text-[#5BE584]">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-[#5BE584]/20 px-2 py-0.5 text-[10px] font-bold text-[#5BE584] border border-[#5BE584]/40">
                    <Sparkles className="h-3 w-3" />
                    New Coaching Invitation
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Received {new Date(inv.invitedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Coach {inv.trainer?.name || "A Coach"} has invited you to train together
                </h3>
                <p className="text-xs text-gray-300">
                  {inv.trainer?.email}
                  {inv.trainer?.specialties && inv.trainer.specialties.length > 0
                    ? ` • Specialties: ${inv.trainer.specialties.join(", ")}`
                    : ""}
                </p>
                {inv.notes && (
                  <p className="mt-1 text-xs italic text-gray-300 bg-black/30 p-2 rounded border border-white/5">
                    "{inv.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => handleDecline(inv)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3.5 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </button>

              <button
                type="button"
                onClick={() => handleAccept(inv)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#5BE584] px-4 py-2 text-xs font-bold text-[#090B0F] hover:bg-[#4ade80] transition-colors disabled:opacity-50 shadow-md"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Accept Invitation
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* History Sharing Consent Modal */}
      {activeConsentRelationship && (
        <HistorySharingConsentDialog
          isOpen={Boolean(activeConsentRelationship)}
          onClose={() => setActiveConsentRelationship(null)}
          relationshipId={activeConsentRelationship.id}
          coachName={activeConsentRelationship.trainer?.name || "your Coach"}
          initialConsent={activeConsentRelationship.historySharingConsent}
        />
      )}
    </>
  );
};
