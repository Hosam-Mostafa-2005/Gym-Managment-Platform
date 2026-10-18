// src/features/landing/components/showcase/ProductPreview.tsx
import React from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  LineChart,
  Ruler,
  Users,
} from "lucide-react";

export const ProductPreview: React.FC<{ activeTab: string }> = ({
  activeTab,
}) => {
  return (
    <div className="w-full rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col">
      {/* App Window Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3039] bg-[#090B0F] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#2A3039]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#2A3039]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#5BE584]" />
          <span className="ml-2 text-xs font-semibold text-[#F8FAFC]">
            STREN Workspace
          </span>
        </div>
        <div className="rounded-[10px] border border-[#2A3039] bg-[#13171D] px-3 py-1 text-[11px] font-mono text-[#94A3B8]">
          /{activeTab}
        </div>
      </div>

      {/* Dynamic Module Preview Body */}
      <div className="p-4 sm:p-6 md:p-8 bg-[#090B0F]/60">
        {activeTab === "coach-dashboard" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Total Members</span>
                  <Users className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">24</p>
                <p className="mt-1 text-xs text-[#22C55E]">19 active this week</p>
              </div>
              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Active Assignments</span>
                  <ClipboardList className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">18</p>
                <p className="mt-1 text-xs text-[#94A3B8]">6 completed blocks</p>
              </div>
              <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Workouts Created</span>
                  <Dumbbell className="h-4 w-4 text-[#5BE584]" />
                </div>
                <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">32</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Shared exercise library</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
                Recent Athlete Activity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      Upper Body Push — Week 3
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Logged 16 sets · 4,820 kg volume
                    </p>
                  </div>
                  <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-medium text-[#22C55E]">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[12px] border border-[#2A3039] bg-[#090B0F] p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      Lower Body Strength A
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Assigned for tomorrow · 5 exercises
                    </p>
                  </div>
                  <span className="rounded-full bg-[#5BE584]/15 px-2.5 py-0.5 text-xs font-medium text-[#5BE584]">
                    Assigned
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members-management" && (
          <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3039] px-4 py-3">
              <span className="text-sm font-semibold text-[#F8FAFC]">
                Assigned Member Roster
              </span>
              <span className="text-xs text-[#94A3B8]">
                Direct access to member profiles, insights & measurements
              </span>
            </div>
            <div className="divide-y divide-[#2A3039]">
              {[
                {
                  name: "Omar Hassan",
                  plan: "Hypertrophy Phase 2",
                  sessions: "14 sessions logged",
                  status: "Active",
                },
                {
                  name: "Sara Al-Mansoor",
                  plan: "Strength Foundation",
                  sessions: "11 sessions logged",
                  status: "Active",
                },
                {
                  name: "Karim Nabil",
                  plan: "Athletic Conditioning",
                  sessions: "9 sessions logged",
                  status: "Active",
                },
              ].map((member) => (
                <div
                  key={member.name}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      {member.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">{member.plan}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#94A3B8]">
                      {member.sessions}
                    </span>
                    <span className="rounded-full border border-[#22C55E]/30 bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-medium text-[#22C55E]">
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "workout-builder" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC]">
                  Full Body Power & Posterior Chain
                </h4>
                <p className="text-xs text-[#94A3B8]">
                  Difficulty: Intermediate · 4 Structured Exercise Blocks
                </p>
              </div>
              <span className="rounded-[10px] bg-[#5BE584] px-3 py-1.5 text-xs font-semibold text-[#090B0F]">
                Assign to Member
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  order: "#1",
                  name: "Trap Bar Deadlift",
                  meta: "4 sets × 5 reps · 150s rest",
                },
                {
                  order: "#2",
                  name: "Incline Dumbbell Press",
                  meta: "4 sets × 8 reps · 90s rest",
                },
                {
                  order: "#3",
                  name: "Chest-Supported Row",
                  meta: "3 sets × 10 reps · 90s rest",
                },
                {
                  order: "#4",
                  name: "Hanging Leg Raise",
                  meta: "3 sets × 12 reps · 60s rest",
                },
              ].map((ex) => (
                <div
                  key={ex.order}
                  className="flex items-center justify-between rounded-[14px] border border-[#2A3039] bg-[#13171D] p-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      {ex.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">{ex.meta}</p>
                  </div>
                  <span className="rounded-[10px] border border-[#2A3039] bg-[#090B0F] px-2.5 py-1 text-xs font-bold text-[#5BE584]">
                    {ex.order}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "member-insights" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Activity className="h-4 w-4 text-[#5BE584]" />
                <span>Completed Sessions</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">28</p>
              <p className="mt-1 text-xs text-[#22C55E]">
                Consistent weekly cadence
              </p>
            </div>
            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <LineChart className="h-4 w-4 text-[#5BE584]" />
                <span>Total Volume Logged</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
                114,250 kg
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Calculated across verified sets
              </p>
            </div>
            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
                <span>Assignment Adherence</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#5BE584]">94%</p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                On-time block completion
              </p>
            </div>
          </div>
        )}

        {activeTab === "body-measurements" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Body Weight</span>
                <Ruler className="h-4 w-4 text-[#5BE584]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">78.4 kg</p>
              <p className="mt-1 text-xs text-[#22C55E]">-1.8 kg vs baseline</p>
            </div>
            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Body Fat %</span>
                <Ruler className="h-4 w-4 text-[#5BE584]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">14.2%</p>
              <p className="mt-1 text-xs text-[#22C55E]">-1.1% over 6 weeks</p>
            </div>
            <div className="rounded-[14px] border border-[#2A3039] bg-[#13171D] p-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Chest / Waist / Arms</span>
                <Ruler className="h-4 w-4 text-[#5BE584]" />
              </div>
              <p className="mt-2 text-lg font-bold text-[#F8FAFC]">
                104 / 79 / 39 cm
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Full historical measurement log
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
