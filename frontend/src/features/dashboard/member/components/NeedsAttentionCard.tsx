// src/features/dashboard/member/components/NeedsAttentionCard.tsx
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Mail,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { useRespondInvitation } from "@/features/coaching-relationships/hooks/useRespondInvitation";
import { toast } from "sonner";
import type { NeedsAttention } from "../../types/dashboard.types";

interface NeedsAttentionCardProps {
  needsAttention?: NeedsAttention;
}

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({
  needsAttention,
}) => {
  const queryClient = useQueryClient();
  const { mutate: respond, isPending } = useRespondInvitation();

  const invitation = needsAttention?.pendingInvitation;
  const unreadCount = needsAttention?.unreadNotificationsCount ?? 0;
  const hasItems = Boolean(invitation || unreadCount > 0);

  const handleRespond = (action: "ACCEPT" | "DECLINE") => {
    if (!invitation) return;

    respond(
      { id: invitation.id, payload: { action } },
      {
        onSuccess: () => {
          toast.success(
            action === "ACCEPT"
              ? `You accepted ${invitation.trainer?.name || "Coach"}'s invitation!`
              : "Coaching invitation declined.",
          );
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to respond to invitation.",
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              hasItems
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {hasItems ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Needs Attention</h2>
            <p className="text-xs text-gray-400">
              {hasItems
                ? "Action items requiring your review"
                : "Your status is up to date"}
            </p>
          </div>
        </div>

        {hasItems && (
          <span className="flex h-5 items-center justify-center rounded-full bg-amber-500/20 px-2 text-[11px] font-bold text-amber-400">
            {(invitation ? 1 : 0) + (unreadCount > 0 ? 1 : 0)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Pending Invitation Alert */}
        {invitation && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Coaching Invitation from {invitation.trainer?.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {invitation.trainer?.email}
                  </p>
                  {invitation.notes && (
                    <p className="mt-1.5 text-xs text-gray-300 italic border-l-2 border-amber-400/40 pl-2">
                      "{invitation.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRespond("ACCEPT")}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-md bg-[#5BE584] px-2.5 py-1 text-xs font-semibold text-black transition hover:bg-[#46c26d] disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleRespond("DECLINE")}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-transparent px-2.5 py-1 text-xs font-semibold text-gray-300 transition hover:bg-gray-800 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-400" /> Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unread Notifications Alert */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-[#1E2329] bg-[#161B22] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-medium text-white">
                  {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                </span>
                <p className="text-[11px] text-gray-400">
                  Updates on assignments and sessions
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-400">
              {unreadCount}
            </span>
          </div>
        )}

        {/* Empty State */}
        {!hasItems && (
          <div className="flex items-center gap-3 rounded-lg border border-[#1E2329] bg-[#161B22]/50 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white">All Caught Up</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                No pending coach invitations or urgent alerts requiring your review.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
