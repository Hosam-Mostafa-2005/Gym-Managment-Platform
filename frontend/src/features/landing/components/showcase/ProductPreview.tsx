// src/features/landing/components/showcase/ProductPreview.tsx
import React from "react";
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  RefreshCw,
  Ruler,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

export const ProductPreview: React.FC<{ activeTab: string }> = ({
  activeTab,
}) => {
  return (
    <div className="w-full rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
      {/* App Window Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3039] bg-[#090B0F] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#F5B942]/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#5BE584]" />
          <span className="ml-2 text-xs font-semibold text-[#F8FAFC]">
            STREN Workspace Explorer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#5BE584]">
            LIVE INTERACTION PREVIEW
          </span>
          <div className="rounded-[8px] border border-[#2A3039] bg-[#13171D] px-2.5 py-0.5 text-[11px] font-mono text-[#94A3B8]">
            /{activeTab}
          </div>
        </div>
      </div>

      {/* Dynamic Module Preview Body */}
      <div className="p-4 sm:p-6 md:p-8 bg-[#090B0F]/70">
        {/* 1. Coach Dashboard Tab */}
        {activeTab === "coach-dashboard" && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Active Roster</span>
                  <Users className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-[#F8FAFC]">18 Athletes</p>
                <p className="mt-1 text-[11px] text-[#22C55E]">100% active this mesocycle</p>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Active Plans</span>
                  <Dumbbell className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-[#F8FAFC]">24 Routines</p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">Assigned across splits</p>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Tonnage Lifted</span>
                  <Activity className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-[#F8FAFC]">142.8 Tonnes</p>
                <p className="mt-1 text-[11px] text-[#22C55E]">+8.4% vs last week</p>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Roster Adherence</span>
                  <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-[#5BE584]">94.2%</p>
                <p className="mt-1 text-[11px] text-[#94A3B8]">Completed on schedule</p>
              </div>
            </div>

            {/* Recent Athlete Activity Feed */}
            <div className="rounded-[16px] border border-[#2A3039] bg-[#13171D] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3039] px-4 py-3 bg-[#11151C]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                  Live Athlete Session Telemetry
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Verified sets & RPE submitted today
                </span>
              </div>
              <div className="divide-y divide-[#1F2630]">
                {[
                  {
                    athlete: "Omar Hassan",
                    workout: "Upper Push Hypertrophy A",
                    tonnage: "4,820 kg",
                    sets: "16 sets completed",
                    rpe: "8.5 RPE",
                    time: "18m ago",
                    status: "Verified",
                  },
                  {
                    athlete: "Sara Al-Mansoor",
                    workout: "Lower Body Squat Focus",
                    tonnage: "6,240 kg",
                    sets: "18 sets completed",
                    rpe: "9.0 RPE",
                    time: "1h ago",
                    status: "Verified",
                  },
                  {
                    athlete: "Karim Nabil",
                    workout: "Posterior Chain & Back",
                    tonnage: "5,110 kg",
                    sets: "15 sets completed",
                    rpe: "8.0 RPE",
                    time: "3h ago",
                    status: "Verified",
                  },
                ].map((row) => (
                  <div
                    key={row.athlete}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#F8FAFC]">{row.athlete}</p>
                      <p className="text-[11px] text-[#94A3B8]">{row.workout}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[#F8FAFC]">{row.tonnage}</span>
                      <span className="text-[#94A3B8]">{row.sets}</span>
                      <span className="rounded-[6px] bg-[#5BE584]/15 px-2 py-0.5 text-[10px] font-bold text-[#5BE584]">
                        {row.rpe}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">{row.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Workout Builder Tab */}
        {activeTab === "workout-builder" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5BE584] rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-2 py-0.5">
                    Template Builder
                  </span>
                  <span className="text-xs text-[#94A3B8]">4 Exercise Blocks</span>
                </div>
                <h4 className="text-base font-bold text-[#F8FAFC] mt-1">
                  Full Body Power & Posterior Chain (Block 2)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-[8px] bg-[#1E252F] border border-[#2A3039] px-3 py-1.5 text-xs text-[#94A3B8]">
                  Difficulty: Intermediate
                </span>
                <span className="rounded-[8px] bg-[#5BE584] px-3 py-1.5 text-xs font-bold text-[#090B0F]">
                  Assign Template
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  order: "01",
                  name: "Trap Bar Deadlift",
                  type: "Primary Compound",
                  targetWeight: "160 kg",
                  targetRpe: "8.5",
                  rest: "180s",
                },
                {
                  order: "02",
                  name: "Incline Dumbbell Press",
                  type: "Upper Hypertrophy",
                  targetWeight: "36 kg",
                  targetRpe: "8.0",
                  rest: "90s",
                },
                {
                  order: "03",
                  name: "Chest-Supported Row",
                  type: "Upper Pull",
                  targetWeight: "32 kg",
                  targetRpe: "8.0",
                  rest: "90s",
                },
                {
                  order: "04",
                  name: "Standing Calf Raise",
                  type: "Isolation Finisher",
                  targetWeight: "65 kg",
                  targetRpe: "9.0",
                  rest: "60s",
                },
              ].map((ex) => (
                <div
                  key={ex.order}
                  className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase">
                        {ex.type}
                      </span>
                      <p className="text-sm font-bold text-[#F8FAFC]">{ex.name}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#5BE584]">
                      #{ex.order}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A3039]/60">
                    <span className="text-[#94A3B8]">
                      Target: <strong className="text-[#F8FAFC]">{ex.targetWeight}</strong>
                    </span>
                    <span className="text-[#94A3B8]">
                      RPE: <strong className="text-[#5BE584]">{ex.targetRpe}</strong>
                    </span>
                    <span className="text-[#94A3B8]">
                      Rest: <strong className="text-[#F8FAFC]">{ex.rest}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Active Member Session Tab */}
        {activeTab === "active-session" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#22C55E] animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    Live Session: Push Hypertrophy A
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    Movement 1 of 4 · Barbell Bench Press · Rest: 120s
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 px-3 py-1 text-xs font-mono font-bold text-[#22C55E]">
                  01:34 Rest Left
                </span>
                <span className="rounded-[8px] bg-[#1B222D] border border-[#2A3039] px-3 py-1 text-xs text-[#F8FAFC]">
                  Tonnage: 3,420 kg
                </span>
              </div>
            </div>

            {/* In-Session Swap Alert */}
            <div className="flex items-center justify-between rounded-[12px] border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-4 py-2.5 text-xs text-[#38BDF8]">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>
                  <strong>Exercise Swapped:</strong> Replaced Flat Barbell Bench with Incline DB
                  Press (Reason: Equipment Occupied).
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold">Logged to Coach</span>
            </div>

            {/* Set Table */}
            <div className="rounded-[14px] border border-[#2A3039] bg-[#11161D] p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2A3039] text-[#94A3B8]">
                    <th className="pb-2 font-semibold">SET</th>
                    <th className="pb-2 font-semibold">PREVIOUS PERFORMANCE</th>
                    <th className="pb-2 font-semibold">TARGET (COACH)</th>
                    <th className="pb-2 font-semibold">LOGGED KG</th>
                    <th className="pb-2 font-semibold">REPS</th>
                    <th className="pb-2 font-semibold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D242E]">
                  <tr>
                    <td className="py-2.5 font-bold text-[#F8FAFC]">1</td>
                    <td className="py-2.5 font-mono text-[#22C55E]">80 kg × 10</td>
                    <td className="py-2.5 text-[#94A3B8]">82.5 kg × 10</td>
                    <td className="py-2.5 font-mono font-bold text-[#F8FAFC]">82.5 kg</td>
                    <td className="py-2.5 font-mono font-bold text-[#F8FAFC]">10 reps</td>
                    <td className="py-2.5 text-right font-semibold text-[#22C55E]">Completed ✓</td>
                  </tr>
                  <tr className="bg-[#171D25]">
                    <td className="py-2.5 font-bold text-[#5BE584]">2</td>
                    <td className="py-2.5 font-mono text-[#22C55E]">82.5 kg × 8</td>
                    <td className="py-2.5 text-[#5BE584]">85 kg × 8</td>
                    <td className="py-2.5 font-mono font-bold text-[#5BE584]">85.0 kg</td>
                    <td className="py-2.5 font-mono font-bold text-[#5BE584]">8 reps</td>
                    <td className="py-2.5 text-right font-semibold text-[#5BE584]">Active Logging</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-[#94A3B8]">3</td>
                    <td className="py-2.5 font-mono text-[#94A3B8]">82.5 kg × 8</td>
                    <td className="py-2.5 text-[#94A3B8]">85 kg × 8</td>
                    <td className="py-2.5 font-mono text-[#94A3B8]">--</td>
                    <td className="py-2.5 font-mono text-[#94A3B8]">--</td>
                    <td className="py-2.5 text-right text-[#94A3B8]">Upcoming</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Body Measurements Tab */}
        {activeTab === "body-measurements" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-3.5">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  Body Weight
                </span>
                <p className="mt-1 text-xl font-bold text-[#F8FAFC]">78.4 kg</p>
                <div className="flex items-center gap-1 text-[11px] text-[#22C55E] mt-0.5">
                  <TrendingDown className="h-3 w-3" /> -1.8 kg vs baseline
                </div>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-3.5">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  Body Fat %
                </span>
                <p className="mt-1 text-xl font-bold text-[#F8FAFC]">14.2%</p>
                <div className="flex items-center gap-1 text-[11px] text-[#22C55E] mt-0.5">
                  <TrendingDown className="h-3 w-3" /> -1.1% over 6 wks
                </div>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-3.5">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  Chest Circumference
                </span>
                <p className="mt-1 text-xl font-bold text-[#F8FAFC]">104 cm</p>
                <div className="flex items-center gap-1 text-[11px] text-[#5BE584] mt-0.5">
                  <TrendingUp className="h-3 w-3" /> +2.5 cm hypertrophy
                </div>
              </div>

              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-3.5">
                <span className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                  Waist Circumference
                </span>
                <p className="mt-1 text-xl font-bold text-[#F8FAFC]">79 cm</p>
                <div className="flex items-center gap-1 text-[11px] text-[#22C55E] mt-0.5">
                  <TrendingDown className="h-3 w-3" /> -3.0 cm taper
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Ruler className="h-5 w-5 text-[#5BE584]" />
                <div>
                  <p className="font-bold text-[#F8FAFC]">Historical Measurement Telemetry</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Recorded by athlete every Monday morning before nutrition check-in.
                  </p>
                </div>
              </div>
              <span className="rounded-[8px] bg-[#090B0F] border border-[#2A3039] px-3 py-1.5 text-xs text-[#94A3B8]">
                Last logged: 2 days ago
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
