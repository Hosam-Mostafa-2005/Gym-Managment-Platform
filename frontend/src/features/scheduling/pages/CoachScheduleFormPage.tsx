// src/features/scheduling/pages/CoachScheduleFormPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Dumbbell,
  FileText,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useMembersManagement } from "@/features/members-management/hooks/use-members-management";
import { useMemberProfile } from "@/features/member-profile/hooks/use-member-profile";
import { useCreateCoachScheduledWorkout } from "../hooks/useScheduling";
import { SearchableMemberSelect } from "@/features/users/components/SearchableMemberSelect";
import { formatMemberDisplay } from "@/features/users/utils/user-display";

export default function CoachScheduleFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedMemberId = searchParams.get("memberId") || "";
  const preselectedWorkoutId = searchParams.get("workoutId") || "";
  const preselectedDate = searchParams.get("date") || "";
  const returnUrl =
    searchParams.get("returnUrl") ||
    (preselectedMemberId
      ? `/members/${preselectedMemberId}/plan`
      : "/coach/schedule");

  const getDefaultDate = () => {
    if (preselectedDate) return preselectedDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [memberId, setMemberId] = useState(preselectedMemberId);
  const [workoutId, setWorkoutId] = useState(preselectedWorkoutId);
  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useWorkouts();
  const { data: membersData, isLoading: isLoadingMembers } =
    useMembersManagement();

  const workouts = Array.isArray(workoutsData)
    ? workoutsData
    : (workoutsData as any)?.workouts || [];

  const rawMembers = (membersData as any)?.members || [];
  const members = useMemo(
    () => rawMembers.map((m: any) => m.member || m),
    [rawMembers],
  );

  const { data: memberProfile } = useMemberProfile(
    preselectedMemberId || undefined,
  );
  const preselectedMember = memberProfile?.member;

  useEffect(() => {
    if (preselectedMemberId) setMemberId(preselectedMemberId);
    if (preselectedWorkoutId) setWorkoutId(preselectedWorkoutId);
  }, [preselectedMemberId, preselectedWorkoutId]);

  const { mutate: scheduleWorkout, isPending } =
    useCreateCoachScheduledWorkout();

  // Selected entities for live preview
  const selectedWorkout = useMemo(() => {
    return workouts.find((w: any) => (w._id || w.id) === workoutId);
  }, [workouts, workoutId]);

  const selectedMember = useMemo(() => {
    const raw = members.find((m: any) => (m._id || m.id) === memberId);
    return raw ? formatMemberDisplay(raw) : null;
  }, [members, memberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!memberId) {
      setError("Please select an athlete.");
      return;
    }

    if (!workoutId) {
      setError("Please select a workout routine.");
      return;
    }

    if (!date || !time) {
      setError("Please select both a date and a time.");
      return;
    }

    const scheduledDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDateTime.getTime())) {
      setError("Invalid date or time selected.");
      return;
    }

    scheduleWorkout(
      {
        memberId,
        workoutId,
        scheduledAt: scheduledDateTime.toISOString(),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate(returnUrl);
        },
        onError: (err: any) => {
          setError(
            err?.response?.data?.message ||
              "Failed to schedule workout session.",
          );
        },
      },
    );
  };

  const formattedDatePreview = useMemo(() => {
    if (!date) return "";
    try {
      const d = new Date(`${date}T${time || "00:00"}:00`);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }, [date, time]);

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30 pb-20">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.03)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span
                className="hover:text-[#9CA3AF] cursor-pointer transition-colors"
                onClick={() => navigate(returnUrl)}
              >
                {preselectedMemberId ? "Member Plan" : "Schedule"}
              </span>
              <span>/</span>
              <span className="text-[#F3F4F6]">Schedule with Form</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Schedule Athlete Workout
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Directly assign a workout session to an athlete's training calendar using a structured form.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const calUrl = memberId
                  ? `/coach/schedule?memberId=${memberId}`
                  : "/coach/schedule";
                navigate(calUrl);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#12161D] border border-[#1E2329] text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <CalendarDays className="h-4 w-4 text-[#5BE584]" />
              <span>Calendar View</span>
            </button>

            <button
              onClick={() => navigate(returnUrl)}
              className="group hidden md:flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-10 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Form: 2 cols */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#1E2329] bg-[#101418]/90 backdrop-blur-sm p-6 sm:p-8 shadow-2xl space-y-6">
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Athlete Selector */}
                <div>
                  <SearchableMemberSelect
                    value={memberId}
                    onChange={setMemberId}
                    members={members}
                    preselectedMember={preselectedMember}
                    disabled={isLoadingMembers || isPending}
                    locked={Boolean(preselectedMemberId)}
                    label="Select Athlete *"
                    placeholder="Search athlete by name or email..."
                  />
                </div>

                {/* 2. Workout Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Dumbbell className="w-3.5 h-3.5 text-[#5BE584]" />
                    <span>Workout Routine *</span>
                  </label>
                  <select
                    value={workoutId}
                    onChange={(e) => setWorkoutId(e.target.value)}
                    disabled={isLoadingWorkouts || isPending}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#12161D] border border-[#1E2329] focus:outline-none focus:border-[#5BE584] text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <option value="">-- Choose a workout routine --</option>
                    {workouts.map((w: any) => (
                      <option
                        key={w._id || w.id}
                        value={w._id || w.id}
                        className="bg-zinc-900"
                      >
                        {w.title} ({w.difficulty || "standard"})
                        {w.category ? ` • ${w.category}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Date & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-[#5BE584]" />
                      <span>Date *</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={isPending}
                      required
                      className="w-full h-11 px-3.5 rounded-xl bg-[#12161D] border border-[#1E2329] focus:outline-none focus:border-[#5BE584] text-sm text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[#5BE584]" />
                      <span>Time *</span>
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      disabled={isPending}
                      required
                      className="w-full h-11 px-3.5 rounded-xl bg-[#12161D] border border-[#1E2329] focus:outline-none focus:border-[#5BE584] text-sm text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Quick Time Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-gray-500 font-medium">Quick Slots:</span>
                  {["07:00", "09:00", "12:00", "15:00", "17:30", "19:00"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        time === slot
                          ? "bg-[#16291D] border border-[#23422E] text-[#5BE584] font-bold"
                          : "bg-[#12161D] border border-[#1E2329] text-gray-400 hover:text-white"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {/* 4. Coaching Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-[#5BE584]" />
                    <span>Coaching Notes & Instructions</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isPending}
                    rows={3}
                    placeholder="Focus on controlled tempo, 90s rest periods, and logging weights carefully..."
                    className="w-full p-3.5 rounded-xl bg-[#12161D] border border-[#1E2329] focus:outline-none focus:border-[#5BE584] text-sm text-white placeholder-gray-600 disabled:opacity-50 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2329]">
                  <button
                    type="button"
                    onClick={() => navigate(returnUrl)}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#5BE584] text-black hover:bg-[#4dd375] shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Schedule Workout Session</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Summary Card: 1 col */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#1E2329] bg-[#101418]/90 backdrop-blur-sm p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-[#5BE584]" />
                <span>Session Summary</span>
              </div>

              {/* Athlete block */}
              <div className="space-y-1.5 pb-4 border-b border-[#1E2329]">
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Athlete
                </div>
                {selectedMember ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] font-bold text-xs">
                      {selectedMember.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {selectedMember.displayName}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {selectedMember.displayEmail}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No athlete selected yet</div>
                )}
              </div>

              {/* Routine block */}
              <div className="space-y-1.5 pb-4 border-b border-[#1E2329]">
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Workout Routine
                </div>
                {selectedWorkout ? (
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {selectedWorkout.title}
                    </div>
                    <div className="text-xs text-[#5BE584] font-medium capitalize">
                      {selectedWorkout.difficulty?.toLowerCase() || "standard"} level
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No routine selected</div>
                )}
              </div>

              {/* Schedule time block */}
              <div className="space-y-1.5 pb-4 border-b border-[#1E2329]">
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                  Planned Date & Time
                </div>
                <div className="text-sm font-semibold text-white">
                  {formattedDatePreview || "—"}
                </div>
                <div className="text-xs font-mono text-[#5BE584]">
                  {time || "—"}
                </div>
              </div>

              {/* Dispatch mode */}
              <div className="rounded-xl bg-[#12161D] p-3 border border-[#1E2329] text-xs space-y-1">
                <div className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5BE584]" />
                  <span>Interactive Queue & Live Log</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  When saved, this scheduled session will appear on the athlete's Training Calendar and in their Dashboard Next Workout queue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
