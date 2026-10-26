import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Play,
  XCircle,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { useScheduledWorkouts } from "../hooks/useScheduledWorkouts";
import { useStartScheduledWorkout } from "../hooks/useStartScheduledWorkout";
import { useCancelScheduledWorkout } from "../hooks/useCancelScheduledWorkout";

export default function ScheduledWorkoutsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming");

  const { data: scheduledWorkouts = [], isLoading, isError } =
    useScheduledWorkouts();
  const { mutate: startScheduled, isPending: isStarting } =
    useStartScheduledWorkout();
  const { mutate: cancelScheduled, isPending: isCancelling } =
    useCancelScheduledWorkout();

  const [startingId, setStartingId] = useState<string | null>(null);

  const now = new Date();

  const filteredWorkouts = scheduledWorkouts.filter((sw) => {
    if (activeTab === "upcoming") {
      return (
        sw.status === "SCHEDULED" && new Date(sw.scheduledAt).getTime() >= now.getTime() - 2 * 3600 * 1000
      );
    }
    return true;
  });

  const handleStart = (id: string) => {
    setStartingId(id);
    startScheduled(id, {
      onSuccess: () => {
        navigate("/sessions/active");
      },
      onSettled: () => {
        setStartingId(null);
      },
    });
  };

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this scheduled workout?")) {
      cancelScheduled(id);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30 pb-32">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.03)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md px-6 lg:px-12 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span>Training</span>
              <span>/</span>
              <span className="text-[#5BE584] font-semibold">Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Scheduled Workouts
            </h1>
            <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
              Plan and view your upcoming training sessions.
            </p>
          </div>

          <Link
            to="/workout-builder"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] shadow-[0_0_20px_rgba(91,229,132,0.15)] self-start sm:self-auto"
          >
            <Plus size={16} /> Schedule a Workout
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8 py-8 space-y-6 animate-in fade-in duration-300">
        {/* Tabs Filter */}
        <div className="flex items-center gap-2 border-b border-[#1E2329] pb-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "upcoming"
                ? "bg-[#5BE584] text-[#090B0F]"
                : "border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white"
            }`}
          >
            Upcoming Sessions
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-[#5BE584] text-[#090B0F]"
                : "border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white"
            }`}
          >
            All Scheduled History
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center text-[#6B7280]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
            <p className="mt-4 text-xs font-medium">Loading schedule...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">
              Failed to load scheduled workouts
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredWorkouts.length === 0 && (
          <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-12 text-center max-w-md mx-auto space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5BE584]/10 text-[#5BE584] mx-auto">
              <Calendar size={24} />
            </div>
            <h3 className="text-base font-bold text-white">
              No Scheduled Workouts
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              {activeTab === "upcoming"
                ? "You have no upcoming workouts scheduled. Select a routine from your library or coach assignment to schedule your next session."
                : "No past or upcoming scheduled records found."}
            </p>
            <div className="pt-2">
              <Link
                to="/workout-builder"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] hover:bg-[#49D472] transition-colors"
              >
                <Dumbbell size={14} /> Browse Workouts
              </Link>
            </div>
          </div>
        )}

        {/* Scheduled Workouts Grid / List */}
        {!isLoading && !isError && filteredWorkouts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkouts.map((sw) => {
              const scheduledDate = new Date(sw.scheduledAt);
              const formattedDate = scheduledDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const formattedTime = scheduledDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });

              const isUpcoming =
                sw.status === "SCHEDULED" &&
                scheduledDate.getTime() >= now.getTime() - 2 * 3600 * 1000;

              return (
                <div
                  key={sw.id}
                  className="rounded-2xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm space-y-4 hover:border-[#2A313A] transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Date & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5BE584]">
                        <Calendar size={14} />
                        {formattedDate} at {formattedTime}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          sw.status === "SCHEDULED"
                            ? "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]"
                            : sw.status === "COMPLETED"
                              ? "bg-white/5 border-white/10 text-[#9CA3AF]"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        {sw.status === "COMPLETED" && <CheckCircle2 size={11} />}
                        {sw.status}
                      </span>
                    </div>

                    {/* Workout Title & Source */}
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {sw.workout?.title || "Workout"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#9CA3AF]">
                        <Dumbbell size={13} className="text-[#6B7280]" />
                        <span>
                          {sw.assignment?.trainer
                            ? `Coach ${sw.assignment.trainer.name}`
                            : "Personal Routine"}
                        </span>
                        {sw.workout?.estimatedDuration && (
                          <>
                            <span className="text-[#1E2329]">•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {sw.workout.estimatedDuration}m
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Notes if present */}
                    {sw.notes && (
                      <p className="text-xs text-[#9CA3AF] bg-[#090B0F] p-3 rounded-xl border border-[#1E2329]/50 italic">
                        "{sw.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  {isUpcoming && (
                    <div className="flex items-center justify-between pt-3 border-t border-[#1E2329]">
                      <button
                        type="button"
                        onClick={() => handleCancel(sw.id)}
                        disabled={isCancelling}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} /> Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStart(sw.id)}
                        disabled={startingId === sw.id || isStarting}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] disabled:opacity-50"
                      >
                        {startingId === sw.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-[#090B0F] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Play size={13} className="fill-current" />
                        )}
                        <span>Start Session</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
