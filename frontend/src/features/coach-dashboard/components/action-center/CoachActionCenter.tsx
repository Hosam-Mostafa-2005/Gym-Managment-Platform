// src/features/coach-dashboard/components/action-center/CoachActionCenter.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Mail,
  Clock,
  UserX,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { ActionCenterData } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface CoachActionCenterProps {
  actionCenter?: ActionCenterData;
}

export const CoachActionCenter: React.FC<CoachActionCenterProps> = ({
  actionCenter = {
    pendingInvitations: [],
    expiringAssignments: [],
    inactiveClients: [],
  },
}) => {
  const navigate = useNavigate();

  const invitations = actionCenter.pendingInvitations || [];
  const expiring = actionCenter.expiringAssignments || [];
  const inactive = actionCenter.inactiveClients || [];

  const totalActions = invitations.length + expiring.length + inactive.length;
  const isClear = totalActions === 0;

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              !isClear
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {!isClear ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Action Center</h2>
            <p className="text-xs text-gray-400">
              Prioritized operational coaching follow-ups
            </p>
          </div>
        </div>

        {!isClear && (
          <span className="flex h-5 items-center justify-center rounded-full bg-amber-500/20 px-2 text-[11px] font-bold text-amber-400">
            {totalActions} item{totalActions > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Actionable List */}
      <div className="mt-4 flex flex-col gap-3">
        {/* 1. Pending Invitations Awaiting Member Response */}
        {invitations.length > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Mail className="h-3.5 w-3.5" />
                <span>Pending Invitations ({invitations.length})</span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/members")}
                className="text-[11px] font-medium text-amber-400/80 hover:text-amber-300 transition inline-flex items-center"
              >
                Manage <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-amber-500/10">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div>
                    <span className="font-medium text-white">{inv.member.name}</span>
                    <span className="text-[11px] text-gray-400 ml-1.5">
                      ({inv.member.email})
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80">
                    Sent {new Date(inv.invitedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Expiring Assignments Ending in <= 7 Days */}
        {expiring.length > 0 && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Expiring Assignments ({expiring.length})</span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/assignments")}
                className="text-[11px] font-medium text-purple-400/80 hover:text-purple-300 transition inline-flex items-center"
              >
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-purple-500/10">
              {expiring.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div>
                    <span className="font-medium text-white">
                      {a.member?.name || "Client"}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-1.5">
                      • {a.workout?.title || "Workout Plan"}
                    </span>
                  </div>
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                    {a.daysRemaining === 0 ? "Ends today" : `${a.daysRemaining}d left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Inactive Clients (>7 Days Inactivity) */}
        {inactive.length > 0 && (
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                <UserX className="h-3.5 w-3.5" />
                <span>Inactive Members &gt;7 Days ({inactive.length})</span>
              </div>
            </div>

            <div className="divide-y divide-orange-500/10">
              {inactive.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div>
                    <span className="font-medium text-white">{client.name}</span>
                    <span className="text-[11px] text-gray-400 ml-1.5">
                      {client.daysSinceLastWorkout !== null
                        ? `(No workout in ${client.daysSinceLastWorkout}d)`
                        : "(No workouts recorded)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/members/${client.id}`)}
                    className="inline-flex items-center gap-1 rounded bg-[#161B22] border border-gray-700 px-2 py-0.5 text-[11px] text-gray-300 hover:border-[#5BE584] hover:text-white transition"
                  >
                    Follow up <ChevronRight className="h-3 w-3 text-[#5BE584]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isClear && (
          <div className="flex items-center gap-3 rounded-lg border border-[#1E2329] bg-[#161B22]/50 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-white">
                Action Center Clear
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                All client assignments, invitations, and workout cadences are on track.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
