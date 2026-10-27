// src/features/coach-dashboard/components/client-health/ClientHealthOverview.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  Lock,
  ChevronRight,
  Search,
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { ClientHealthItem } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface ClientHealthOverviewProps {
  clients?: ClientHealthItem[];
}

export const ClientHealthOverview: React.FC<ClientHealthOverviewProps> = ({
  clients = [],
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getActivityBadge = (
    status: "ACTIVE" | "INACTIVE_7_DAYS" | "NO_WORKOUTS",
    daysSince: number | null,
  ) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Active {daysSince !== null ? `(${daysSince}d ago)` : ""}
          </span>
        );
      case "INACTIVE_7_DAYS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Inactive ({daysSince}d ago)
          </span>
        );
      case "NO_WORKOUTS":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            No Sessions
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
      {/* Header with Title and Search Input */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2329] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Client Health & Activity Overview
            </h2>
            <p className="text-xs text-gray-400">
              Transparent tracking of client workout activity and authorized metrics
            </p>
          </div>
        </div>

        {clients.length > 3 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-60 rounded-lg border border-[#1E2329] bg-[#0D1014] pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Table or Cards */}
      <div className="mt-4 overflow-x-auto">
        {filteredClients.length > 0 ? (
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2329] text-gray-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Member</th>
                <th className="pb-3 font-semibold">Activity Status</th>
                <th className="pb-3 font-semibold">Last Workout</th>
                <th className="pb-3 font-semibold">Monthly Sessions</th>
                <th className="pb-3 font-semibold">Latest Weight</th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2329]/50">
              {filteredClients.map((client) => {
                const measurement = client.latestMeasurement;
                const isRestricted = measurement?.isRestricted;

                return (
                  <tr
                    key={client.id}
                    className="group hover:bg-[#161B22]/60 transition"
                  >
                    {/* Member Details */}
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white group-hover:text-[#5BE584] transition">
                        {client.name}
                      </div>
                      <div className="text-[11px] text-gray-400">{client.email}</div>
                    </td>

                    {/* Activity Status */}
                    <td className="py-3 pr-4">
                      {getActivityBadge(client.activityStatus, client.daysSinceLastWorkout)}
                    </td>

                    {/* Last Workout Date */}
                    <td className="py-3 pr-4 text-gray-300">
                      {client.lastWorkoutDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {new Date(client.lastWorkoutDate).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Sessions this month */}
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-white">
                        {client.completedSessionsThisMonth}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-1">in 30d</span>
                    </td>

                    {/* Latest Body Weight / Privacy Lock */}
                    <td className="py-3 pr-4">
                      {isRestricted ? (
                        <span className="inline-flex items-center gap-1 rounded bg-gray-800/80 px-2 py-0.5 text-[11px] font-medium text-gray-400 border border-gray-700">
                          <Lock className="h-3 w-3 text-amber-400" />
                          Consent Restricted
                        </span>
                      ) : measurement?.weight ? (
                        <div className="flex items-center gap-1 text-white font-medium">
                          <Scale className="h-3 w-3 text-emerald-400" />
                          <span>{measurement.weight} kg</span>
                          {measurement.measuredAt && (
                            <span className="text-[10px] text-gray-500 ml-1">
                              (
                              {new Date(measurement.measuredAt).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                              )
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Action: Open Member Profile */}
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/members/${client.id}`)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#1E2329] bg-[#161B22] px-2.5 py-1 text-xs font-medium text-gray-300 hover:border-[#5BE584] hover:text-white transition"
                      >
                        Profile <ChevronRight className="h-3 w-3 text-[#5BE584]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Empty Roster State */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-gray-500 mb-2" />
            <h4 className="text-sm font-semibold text-white">No Members Found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              {searchTerm
                ? "No clients match your search filter."
                : "You do not have any active coached or assigned members yet."}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => navigate("/members")}
                className="mt-3 rounded-lg bg-[#5BE584] px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-[#46c26d]"
              >
                Go to Members Management
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
