import React from "react";
import { Mail, Clock, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useCoachInvitations } from "../hooks/useCoachInvitations";
import { useCancelInvitation } from "../hooks/useCancelInvitation";

export const PendingInvitationsList: React.FC = () => {
  const { data: invitations, isLoading, isError, error } = useCoachInvitations();
  const { mutate: cancelInvite, isPending: isCancelling } = useCancelInvitation();

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-xs">Loading sent invitations...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed to load invitations: {(error as any)?.message || "Unknown error"}</span>
      </div>
    );
  }

  const pendingList = (invitations || []).filter(
    (inv) => inv.status === "PENDING" && inv.isActive,
  );

  if (pendingList.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1E2329] bg-[#0D1014] p-4">
      <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-gray-100">
            Pending Coaching Invitations ({pendingList.length})
          </h3>
        </div>
        <span className="text-[11px] text-gray-500">
          Awaiting member response
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pendingList.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col justify-between rounded-lg border border-[#1E2329] bg-[#101418] p-3 transition-colors hover:border-[#2A313A]"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-200">
                  {inv.member?.name || "Registered Member"}
                </span>
                <span className="inline-flex items-center rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                  Pending
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Mail className="h-3 w-3 text-gray-500" />
                <span className="truncate">{inv.member?.email}</span>
              </div>
              {inv.notes && (
                <p className="text-[11px] text-gray-500 line-clamp-2 italic bg-[#0D1014] p-2 rounded border border-[#1E2329]">
                  "{inv.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1E2329] text-[10px] text-gray-500">
              <span>Invited {formatDate(inv.invitedAt)}</span>
              <button
                type="button"
                onClick={() => cancelInvite(inv.id)}
                disabled={isCancelling}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Cancel Invitation"
              >
                <Trash2 className="h-3 w-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
