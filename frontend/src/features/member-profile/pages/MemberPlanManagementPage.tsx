// src/features/member-profile/pages/MemberPlanManagementPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Layers,
  Dumbbell,
  Calendar,
  Utensils,
  ArrowLeft,
  Plus,
  CalendarDays,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Flame,
  Droplets,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useMemberProfile } from "../hooks/use-member-profile";
import { useCoachScheduledWorkouts } from "@/features/scheduling/hooks/useScheduling";
import { useCoachMemberNutrition } from "@/features/nutrition/hooks/useNutrition";
import { formatMemberDisplay } from "@/features/users/utils/user-display";
import { MemberProfileLoading } from "../components/states/MemberProfileLoading";
import { MemberProfileError } from "../components/states/MemberProfileError";

type ActiveTab = "workouts" | "scheduling" | "nutrition";

export default function MemberPlanManagementPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("workouts");

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileError,
    refetch,
  } = useMemberProfile(memberId);

  const { data: scheduledWorkouts = [], isLoading: isLoadingSchedules } =
    useCoachScheduledWorkouts(memberId ? { memberId } : undefined);

  const { data: nutritionData, isLoading: isLoadingNutrition } =
    useCoachMemberNutrition(memberId || "");

  if (isLoadingProfile) {
    return <MemberProfileLoading />;
  }

  if (isProfileError || !profileData) {
    return (
      <MemberProfileError
        message={
          profileError instanceof Error
            ? profileError.message
            : "Failed to load member plan"
        }
        onRetry={() => refetch()}
      />
    );
  }

  const { member, overview, assignmentHistory, coachingRelationship } =
    profileData;
  const display = formatMemberDisplay(member);
  const activeAssignment = overview?.currentAssignment;
  const activeNutritionPlan = nutritionData?.overview?.plan;

  const formatDate = (dateStr: string) => {
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
    <div className="min-h-screen bg-[#090B0F] text-white p-4 md:p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <Link
              to="/members"
              className="hover:text-white transition-colors"
            >
              Members
            </Link>
            <span>/</span>
            <Link
              to={`/members/${memberId}`}
              className="hover:text-white transition-colors"
            >
              {display.displayName}
            </Link>
            <span>/</span>
            <span className="text-[#5BE584] font-semibold">Manage Plan</span>
          </div>

          <button
            onClick={() => navigate(`/members/${memberId}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Member Profile
          </button>
        </div>

        {/* Member Plan Locked Identity Header */}
        <div className="rounded-2xl border border-[#1E2329] bg-[#0D1117] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#23422E] bg-[#16291D] text-[#5BE584] text-xl font-bold">
              {display.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight truncate">
                  {display.displayName}
                </h1>
                <span className="rounded-md bg-[#16291D] border border-[#23422E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5BE584]">
                  Athlete Plan Management
                </span>
                {display.isTestAccount && (
                  <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                    Demo Account
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="truncate">{display.displayEmail}</span>
                {coachingRelationship && (
                  <>
                    <span>•</span>
                    <span className="text-gray-300 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-[#5BE584]" />
                      Assigned to {coachingRelationship.trainer?.name || "You"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Tab Selectors */}
          <div className="flex items-center bg-[#161B22] p-1.5 rounded-xl border border-[#1E2329] text-xs font-semibold">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "workouts"
                  ? "bg-[#5BE584] text-black font-bold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Dumbbell size={14} />
              <span>Routine Assignment</span>
            </button>
            <button
              onClick={() => setActiveTab("scheduling")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "scheduling"
                  ? "bg-[#5BE584] text-black font-bold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Calendar size={14} />
              <span>Scheduled Workouts</span>
            </button>
            <button
              onClick={() => setActiveTab("nutrition")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "nutrition"
                  ? "bg-[#5BE584] text-black font-bold shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Utensils size={14} />
              <span>Nutrition Plan</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Workout Routine Assignment */}
        {activeTab === "workouts" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Active Assignment Card */}
            <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2329]">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Dumbbell className="text-[#5BE584]" size={18} />
                    Current Workout Assignment
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Structured routine assigned for this athlete's training block.
                  </p>
                </div>

                <Link
                  to={`/assignments/new?memberId=${memberId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] text-black hover:bg-[#4dd375] shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={14} />
                  <span>Assign Workout Routine</span>
                </Link>
              </div>

              <div className="pt-6">
                {activeAssignment ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0D1117] border border-[#1E2329] rounded-xl p-5">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Routine Title
                      </div>
                      <div className="text-base font-bold text-white mt-1">
                        {activeAssignment.workout?.title || "Workout Plan"}
                      </div>
                      <div className="text-xs text-[#5BE584] font-medium capitalize mt-0.5">
                        {(activeAssignment.workout as any)?.category || "Standard Program"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Duration & Timeline
                      </div>
                      <div className="text-sm font-semibold text-gray-200 mt-1">
                        {formatDate(activeAssignment.startDate)} –{" "}
                        {formatDate(activeAssignment.endDate)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Assigned by {activeAssignment.trainer?.name || "Trainer"}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center md:items-end">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 border border-green-500/20 text-green-400 w-fit">
                        <CheckCircle2 size={12} />
                        {activeAssignment.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#1E2329] text-center">
                    <Dumbbell className="h-8 w-8 text-gray-600 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-300">
                      No Active Workout Assignment
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                      This athlete currently does not have an active workout routine assigned.
                    </p>
                    <Link
                      to={`/assignments/new?memberId=${memberId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#16291D] border border-[#23422E] text-[#5BE584] hover:bg-[#1f3a29] transition-all"
                    >
                      <Plus size={14} />
                      Assign Routine Now
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment History */}
            <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-gray-200 mb-4">
                Assignment History ({assignmentHistory?.length || 0})
              </h3>
              {assignmentHistory && assignmentHistory.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[#1E2329]">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="border-b border-[#1E2329] bg-[#0D1117] uppercase tracking-wider text-gray-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Workout</th>
                        <th className="px-4 py-3">Trainer</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Start Date</th>
                        <th className="px-4 py-3">End Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2329]">
                      {assignmentHistory.map((a: any) => (
                        <tr key={a.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">
                            {a.workout?.title || "Workout"}
                          </td>
                          <td className="px-4 py-3">{a.trainer?.name || "—"}</td>
                          <td className="px-4 py-3 font-bold uppercase text-[10px]">
                            {a.status}
                          </td>
                          <td className="px-4 py-3">{formatDate(a.startDate)}</td>
                          <td className="px-4 py-3">{formatDate(a.endDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-gray-500 text-center py-6">
                  No previous assignment records.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Workout Scheduling (Calendar & Form options) */}
        {activeTab === "scheduling" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2329]">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="text-[#5BE584]" size={18} />
                    Scheduled Workout Sessions
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Specific dates and times scheduled for this athlete to perform workouts.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    to={`/coach/schedule/new?memberId=${memberId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5BE584] text-black hover:bg-[#4dd375] shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FileText size={14} />
                    <span>Schedule with Form</span>
                  </Link>
                  <Link
                    to={`/coach/schedule?memberId=${memberId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#12161D] border border-[#1E2329] text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <CalendarDays size={14} className="text-[#5BE584]" />
                    <span>View on Calendar</span>
                  </Link>
                </div>
              </div>

              <div className="pt-6">
                {isLoadingSchedules ? (
                  <div className="text-xs text-gray-400 text-center py-8">
                    Loading scheduled workouts...
                  </div>
                ) : scheduledWorkouts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledWorkouts.map((sw: any) => {
                      const d = new Date(sw.scheduledAt);
                      const dateStr = d.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      const timeStr = d.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={sw.id}
                          className="flex items-start justify-between p-4 rounded-xl border border-[#1E2329] bg-[#0D1117] hover:border-[#23422E] transition-all"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                              <Dumbbell size={18} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">
                                {sw.workout?.title || "Workout Session"}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <Clock size={12} className="text-[#5BE584]" />
                                <span>{dateStr} at {timeStr}</span>
                              </div>
                              {sw.notes && (
                                <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 italic">
                                  "{sw.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="rounded bg-[#161B22] border border-[#1E2329] px-2 py-0.5 text-[10px] font-mono text-gray-400 uppercase shrink-0 ml-2">
                            {sw.status || "SCHEDULED"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#1E2329] text-center">
                    <Calendar className="h-8 w-8 text-gray-600 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-300">
                      No Scheduled Workouts Found
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                      Schedule individual workout days for this athlete to guide their weekly calendar.
                    </p>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/coach/schedule/new?memberId=${memberId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] text-black hover:bg-[#4dd375] transition-all"
                      >
                        <FileText size={14} />
                        Schedule with Form
                      </Link>
                      <Link
                        to={`/coach/schedule?memberId=${memberId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#12161D] border border-[#1E2329] text-gray-300 hover:text-white transition-all"
                      >
                        <CalendarDays size={14} />
                        Calendar View
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Nutrition Plan */}
        {activeTab === "nutrition" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2329]">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Utensils className="text-[#5BE584]" size={18} />
                    Nutrition Plan & Macros
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Personalized caloric targets, macronutrient split, and dietary preferences.
                  </p>
                </div>

                <Link
                  to={`/coach/nutrition/${memberId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] text-black hover:bg-[#4dd375] shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ExternalLink size={14} />
                  <span>Open Full Nutrition Workspace</span>
                </Link>
              </div>

              <div className="pt-6">
                {isLoadingNutrition ? (
                  <div className="text-xs text-gray-400 text-center py-8">
                    Loading nutrition details...
                  </div>
                ) : activeNutritionPlan ? (
                  <div className="space-y-6">
                    {/* Targets row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2329]">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase">
                          <Flame size={12} className="text-orange-400" />
                          <span>Daily Calories</span>
                        </div>
                        <div className="text-2xl font-black text-white mt-1">
                          {activeNutritionPlan.targetCalories || 0}{" "}
                          <span className="text-xs font-normal text-gray-500">kcal</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2329]">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Protein
                        </div>
                        <div className="text-2xl font-black text-emerald-400 mt-1">
                          {activeNutritionPlan.targetProteinG || 0}{" "}
                          <span className="text-xs font-normal text-gray-500">g</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2329]">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Carbs
                        </div>
                        <div className="text-2xl font-black text-blue-400 mt-1">
                          {activeNutritionPlan.targetCarbsG || 0}{" "}
                          <span className="text-xs font-normal text-gray-500">g</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2329]">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase">
                          Fats
                        </div>
                        <div className="text-2xl font-black text-amber-400 mt-1">
                          {activeNutritionPlan.targetFatG || 0}{" "}
                          <span className="text-xs font-normal text-gray-500">g</span>
                        </div>
                      </div>
                    </div>

                    {/* Preferences & Details */}
                    <div className="p-5 rounded-xl bg-[#0D1117] border border-[#1E2329] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Plan Name:{" "}
                          <span className="text-[#5BE584] uppercase font-bold">
                            {activeNutritionPlan.name || "Active Macro Plan"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Source: {activeNutritionPlan.source === "COACH_ASSIGNED" ? "Coach Assigned" : "Self-Guided"} • Version: {activeNutritionPlan.version}
                        </div>
                      </div>

                      <Link
                        to={`/coach/nutrition/${memberId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5BE584] hover:underline"
                      >
                        <span>Update targets or generate new plan</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#1E2329] text-center">
                    <Utensils className="h-8 w-8 text-gray-600 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-300">
                      No Active Nutrition Plan
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                      Create a personalized macro plan or review the athlete's nutrition onboarding biometrics.
                    </p>
                    <Link
                      to={`/coach/nutrition/${memberId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] text-black hover:bg-[#4dd375] transition-all"
                    >
                      <Plus size={14} />
                      Configure Nutrition Plan
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
