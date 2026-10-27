// src/features/nutrition/pages/CoachNutritionRosterPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Utensils,
  ChevronRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Calendar,
  Loader2,
} from "lucide-react";
import { useCoachEligibleMembers } from "../hooks/useNutrition";

export const CoachNutritionRosterPage: React.FC = () => {
  const { data: members = [], isLoading, error } = useCoachEligibleMembers();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-24 text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
              <span>Athlete Nutrition Management</span>
              <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-3 py-0.5 text-xs font-semibold text-[#5BE584]">
                {members.length} Active Athletes
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Manage custom nutritional plans, inspect actual intake logs, and verify compliance
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {error instanceof Error ? error.message : "Failed to load athlete roster."}
          </div>
        )}

        {members.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-12 text-center space-y-4">
            <Users className="mx-auto h-12 w-12 text-zinc-600" />
            <h2 className="text-xl font-bold text-zinc-100">No Eligible Athletes Found</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              You can manage nutrition plans for members with an active coaching relationship.
              Invite members from your Roster or Members Management page first.
            </p>
            <Link
              to="/members/all"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-[#4dd374] transition-all"
            >
              <span>Go to Members Roster</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#161B22]/80 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Athlete</th>
                    <th className="py-3 px-5">Goal / Preference</th>
                    <th className="py-3 px-5">Active Nutrition Plan</th>
                    <th className="py-3 px-5">Last Logged</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {members.map((m) => (
                    <tr
                      key={m.memberId}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="font-semibold text-sm text-zinc-100">{m.name}</div>
                        <div className="text-zinc-400 text-xs">{m.email}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-zinc-200">
                          {m.goal.replace("_", " ")}
                        </div>
                        <div className="text-zinc-400 text-[11px]">{m.dietaryPreference}</div>
                      </td>
                      <td className="py-4 px-5">
                        {m.activePlan ? (
                          <div>
                            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                              <span>{m.activePlan.name}</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                                  m.activePlan.source === "COACH_ASSIGNED"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}
                              >
                                {m.activePlan.source === "COACH_ASSIGNED"
                                  ? "Coach"
                                  : "Self-Guided"}
                              </span>
                            </div>
                            <div className="text-zinc-400 text-[11px] mt-0.5">
                              {m.activePlan.targetCalories} kcal • {m.activePlan.targetProteinG}g P
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">No plan active</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-zinc-400">
                        {m.lastLoggedAt ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                            <span>
                              {new Date(m.lastLoggedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">Never</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/coach/nutrition/${m.memberId}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-[#161B22] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#5BE584] hover:text-[#5BE584] transition-all"
                        >
                          <Utensils className="h-3.5 w-3.5" />
                          <span>Manage Plan & Logs</span>
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachNutritionRosterPage;
