// src/features/dashboard/member/components/NextWorkoutCard.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Calendar,
  Clock,
  Dumbbell,
  ArrowRight,
  Sparkles,
  UserCheck,
  CalendarDays,
} from "lucide-react";
import { useStartWorkoutSession } from "@/features/workout-sessions/hooks/useStartWorkoutSession";
import { useCurrentWorkoutSession } from "@/features/workout-sessions/hooks/useCurrentWorkoutSession";
import { useStartScheduledWorkout } from "@/features/scheduling/hooks/useScheduling";
import ActiveWorkoutConflictDialog from "@/features/workout-sessions/components/ActiveWorkoutConflictDialog";
import { toast } from "sonner";
import type {
  DashboardAssignment,
  DashboardWorkout,
  UpcomingScheduledWorkout,
} from "../../types/dashboard.types";

interface NextWorkoutCardProps {
  assignment?: DashboardAssignment | null;
  workout?: DashboardWorkout | null;
  upcomingWorkouts?: UpcomingScheduledWorkout[];
}

export const NextWorkoutCard: React.FC<NextWorkoutCardProps> = ({
  assignment,
  workout,
  upcomingWorkouts = [],
}) => {
  const navigate = useNavigate();
  const { mutate: startSession, isPending: isStartingSession } =
    useStartWorkoutSession();
  const { mutate: startScheduled, isPending: isStartingScheduled } =
    useStartScheduledWorkout();
  const { data: currentSessionData } = useCurrentWorkoutSession();

  const isPending = isStartingSession || isStartingScheduled;

  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    activeSessionId: string;
    activeWorkoutTitle: string;
    requestedWorkoutId?: string;
    requestedWorkoutTitle?: string;
    requestedAssignmentId?: string;
  }>({
    isOpen: false,
    activeSessionId: "",
    activeWorkoutTitle: "",
  });

  // Determine the next relevant actionable workout:
  // 1. Earliest upcoming scheduled workout (ready to perform today or upcoming)
  // 2. Active assignment workout (assigned program ready to perform)
  // 3. Personal custom workout routine
  const nextSchedule = upcomingWorkouts.length > 0 ? upcomingWorkouts[0] : null;
  const isScheduled = Boolean(nextSchedule);
  const targetWorkout = nextSchedule?.workout || assignment?.workout || workout;

  // Determine whether the active assignment is the same as the scheduled workout
  const isAssigned = Boolean(assignment);
  const isAssignedAndScheduled = Boolean(
    isScheduled &&
      assignment &&
      (nextSchedule?.workoutId === assignment.workout?.id ||
        nextSchedule?.workoutId === (assignment as any).workoutId),
  );

  const reqWorkoutId =
    targetWorkout?.id ||
    (targetWorkout as any)?._id ||
    assignment?.workout?.id ||
    (assignment as any)?.workoutId;
  const reqAssignmentId = assignment?.id || (assignment as any)?._id;
  const reqWorkoutTitle = targetWorkout?.title || "Workout Session";

  const handleStartWorkout = () => {
    const active = currentSessionData?.session;

    if (active && active.status === "IN_PROGRESS") {
      const activeWorkoutId = active.workout?.id || (active as any).workoutId;
      if (activeWorkoutId === reqWorkoutId) {
        toast.success("Resuming your active workout session.");
        navigate("/sessions/active");
        return;
      }

      setConflictModal({
        isOpen: true,
        activeSessionId: active.id,
        activeWorkoutTitle: active.workout?.title || "Active Workout",
        requestedWorkoutId: reqWorkoutId,
        requestedWorkoutTitle: reqWorkoutTitle,
        requestedAssignmentId: reqAssignmentId,
      });
      return;
    }

    // Prioritize scheduled session start
    if (nextSchedule) {
      startScheduled(nextSchedule.id, {
        onSuccess: () => navigate("/sessions/active"),
        onError: (err: any) => {
          const conflictData = err?.response?.data?.data;
          if (err?.response?.status === 409 && conflictData?.activeSessionId) {
            setConflictModal({
              isOpen: true,
              activeSessionId: conflictData.activeSessionId,
              activeWorkoutTitle:
                conflictData.activeWorkoutTitle || "Active Workout",
              requestedWorkoutId: reqWorkoutId,
              requestedWorkoutTitle: reqWorkoutTitle,
              requestedAssignmentId: reqAssignmentId,
            });
          } else {
            toast.error(
              err?.response?.data?.message || "Failed to start scheduled workout.",
            );
          }
        },
      });
      return;
    }

    // Start by assigned workout program
    if (assignment) {
      startSession(
        { assignment: reqAssignmentId },
        {
          onSuccess: () => navigate("/sessions/active"),
          onError: (err: any) => {
            const conflictData = err?.response?.data?.data;
            if (err?.response?.status === 409 && conflictData?.activeSessionId) {
              setConflictModal({
                isOpen: true,
                activeSessionId: conflictData.activeSessionId,
                activeWorkoutTitle:
                  conflictData.activeWorkoutTitle || "Active Workout",
                requestedWorkoutId: reqWorkoutId,
                requestedWorkoutTitle: reqWorkoutTitle,
                requestedAssignmentId: reqAssignmentId,
              });
            } else {
              toast.error(
                err?.response?.data?.message || "Failed to start workout session.",
              );
            }
          },
        },
      );
      return;
    }

    // Start personal routine
    if (reqWorkoutId) {
      startSession(
        { workout: reqWorkoutId },
        {
          onSuccess: () => navigate("/sessions/active"),
          onError: (err: any) => {
            const conflictData = err?.response?.data?.data;
            if (err?.response?.status === 409 && conflictData?.activeSessionId) {
              setConflictModal({
                isOpen: true,
                activeSessionId: conflictData.activeSessionId,
                activeWorkoutTitle:
                  conflictData.activeWorkoutTitle || "Active Workout",
                requestedWorkoutId: reqWorkoutId,
                requestedWorkoutTitle: reqWorkoutTitle,
              });
            } else {
              toast.error(
                err?.response?.data?.message || "Failed to start workout session.",
              );
            }
          },
        },
      );
    } else {
      navigate("/workout-builder/all");
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Next Workout</h2>
              <p className="text-xs text-gray-400">
                {isAssignedAndScheduled
                  ? "Assigned routine scheduled on your calendar"
                  : isScheduled
                    ? "Scheduled session on your calendar"
                    : isAssigned
                      ? "Active workout program assignment"
                      : "Up next in your routine"}
              </p>
            </div>
          </div>

          {targetWorkout && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                isAssignedAndScheduled
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : isScheduled
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : isAssigned
                      ? "bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/20"
                      : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              }`}
            >
              {isAssignedAndScheduled
                ? "Scheduled Assignment"
                : isScheduled
                  ? "Scheduled"
                  : isAssigned
                    ? "Assigned Program"
                    : "Personal Routine"}
            </span>
          )}
        </div>

        {/* Content Body */}
        {targetWorkout ? (
          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <Link
                to={`/workouts/${reqWorkoutId}`}
                className="text-lg font-bold text-white hover:text-[#5BE584] transition"
              >
                {targetWorkout.title}
              </Link>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                {targetWorkout.estimatedDuration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {targetWorkout.estimatedDuration} mins
                  </span>
                )}
                {targetWorkout.difficulty && (
                  <span className="capitalize text-gray-300">
                    • {targetWorkout.difficulty.toLowerCase()}
                  </span>
                )}
                {targetWorkout.category && (
                  <span className="capitalize text-gray-300">
                    • {targetWorkout.category.toLowerCase()}
                  </span>
                )}
                {isScheduled && nextSchedule?.scheduledAt && (
                  <span className="inline-flex items-center gap-1 text-blue-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(nextSchedule.scheduledAt).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                )}
                {!isScheduled && isAssigned && (
                  <span className="inline-flex items-center gap-1 text-[#5BE584] font-medium">
                    <UserCheck className="h-3.5 w-3.5" />
                    Ready to perform
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartWorkout}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5BE584] px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-[#46c26d] active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-black" />
                {isPending ? "Starting..." : "Start Workout"}
              </button>
            </div>
          </div>
        ) : (
          /* Graceful Fallback State */
          <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#161B22] text-gray-400">
              <Sparkles className="h-6 w-6 text-[#5BE584]" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">
              No Workouts Queued
            </h3>
            <p className="mt-1 max-w-sm text-xs text-gray-400">
              You don't have any scheduled sessions or assigned programs right
              now. Explore workouts or plan sessions on your calendar.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/workout-builder/all")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#5BE584] px-3.5 py-2 text-xs font-semibold text-black shadow-sm transition hover:bg-[#46c26d]"
              >
                Browse Workouts <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/calendar")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3.5 py-2 text-xs font-semibold text-gray-300 transition hover:bg-[#20262F] hover:text-white"
              >
                <CalendarDays className="h-3.5 w-3.5 text-[#5BE584]" />
                Training Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {conflictModal.isOpen && (
        <ActiveWorkoutConflictDialog
          isOpen={conflictModal.isOpen}
          activeSessionId={conflictModal.activeSessionId}
          activeWorkoutTitle={conflictModal.activeWorkoutTitle}
          requestedWorkoutId={conflictModal.requestedWorkoutId}
          requestedWorkoutTitle={conflictModal.requestedWorkoutTitle}
          requestedAssignmentId={conflictModal.requestedAssignmentId}
          onClose={() =>
            setConflictModal((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}
    </>
  );
};
