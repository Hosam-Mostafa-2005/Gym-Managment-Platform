// src/features/dashboard/member/components/assignment/CurrentAssignment.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Calendar, Tag, Clock, Play, Dumbbell } from "lucide-react";
import { useStartWorkoutSession } from "@/features/workout-sessions/hooks/useStartWorkoutSession";
import { useCurrentWorkoutSession } from "@/features/workout-sessions/hooks/useCurrentWorkoutSession";
import ActiveWorkoutConflictDialog from "@/features/workout-sessions/components/ActiveWorkoutConflictDialog";
import { toast } from "sonner";

interface CurrentAssignmentProps {
  assignment?: any;
  workout?: any;
}

export const CurrentAssignment: React.FC<CurrentAssignmentProps> = ({
  assignment,
  workout,
}) => {
  const navigate = useNavigate();
  const { mutate: startSession, isPending } = useStartWorkoutSession();
  const { data: currentSessionData } = useCurrentWorkoutSession();

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

  const handleStartWorkout = () => {
    const active = currentSessionData?.session;
    const reqWorkoutId = workout?.id || workout?._id || assignment?.workout?.id || assignment?.workoutId;
    const reqAssignmentId = assignment?.id || assignment?._id;
    const reqWorkoutTitle = workout?.title || assignment?.workout?.title || "Workout Routine";

    if (active && active.status === "IN_PROGRESS") {
      const activeWorkoutId = active.workout?.id || (active as any).workoutId;
      if (activeWorkoutId === reqWorkoutId) {
        toast.success("You already have an active workout. Resuming your session.");
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

    if (assignment) {
      const assignmentId = assignment.id || assignment._id;
      startSession(
        { assignment: assignmentId },
        {
          onSuccess: () => navigate("/sessions/active"),
          onError: (err: any) => {
            const conflictData = err?.response?.data?.data;
            if (err?.response?.status === 409 && conflictData?.activeSessionId) {
              setConflictModal({
                isOpen: true,
                activeSessionId: conflictData.activeSessionId,
                activeWorkoutTitle: conflictData.activeWorkoutTitle || "Active Workout",
                requestedWorkoutId: reqWorkoutId,
                requestedWorkoutTitle: reqWorkoutTitle,
                requestedAssignmentId: reqAssignmentId,
              });
            } else {
              toast.error(err?.response?.data?.message || "Failed to start workout session.");
            }
          },
        },
      );
    } else if (workout) {
      const workoutId = workout.id || workout._id;
      startSession(
        { workout: workoutId },
        {
          onSuccess: () => navigate("/sessions/active"),
          onError: (err: any) => {
            const conflictData = err?.response?.data?.data;
            if (err?.response?.status === 409 && conflictData?.activeSessionId) {
              setConflictModal({
                isOpen: true,
                activeSessionId: conflictData.activeSessionId,
                activeWorkoutTitle: conflictData.activeWorkoutTitle || "Active Workout",
                requestedWorkoutId: reqWorkoutId,
                requestedWorkoutTitle: reqWorkoutTitle,
              });
            } else {
              toast.error(err?.response?.data?.message || "Failed to start workout session.");
            }
          },
        },
      );
    }
  };

  if (!assignment && !workout) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] py-12 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5BE584]/10 text-[#5BE584] mb-3">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-200">
          No Active Workout Program
        </h3>
        <p className="mt-1 text-xs text-gray-400 max-w-sm">
          You don't have an active program yet. Build a custom personal routine or explore the exercise library to start training.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/workout-builder/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80]"
          >
            Create Personal Workout
          </Link>
          <Link
            to="/workout-builder/all"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:border-[#6B7280]"
          >
            Browse Workouts
          </Link>
        </div>
      </div>
    );
  }

  const startDate = assignment?.startDate
    ? new Date(assignment.startDate).toLocaleDateString()
    : null;
  const endDate = assignment?.endDate
    ? new Date(assignment.endDate).toLocaleDateString()
    : null;

  const workoutId = workout?.id || workout?._id;

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">
          {assignment ? "Assigned Program" : "Current Workout"}
        </h2>
        <span className="rounded bg-[#5BE584]/10 px-2.5 py-1 text-xs font-medium text-[#5BE584]">
          {assignment?.status || "Ready to Train"}
        </span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-white">
            {workout?.title || workout?.name || "Untitled Workout"}
          </h3>
          {workout?.description && (
            <p className="text-sm text-gray-400 line-clamp-2 max-w-xl">
              {workout.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartWorkout}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80] disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isPending ? "Starting..." : "Start Workout"}
          </button>
          {workoutId && (
            <Link
              to={`/workout-builder/${workoutId}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#101418] px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:border-[#6B7280]"
            >
              Details
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#1E2329] pt-4">
        {startDate && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {startDate} - {endDate}
            </span>
          </div>
        )}
        {workout?.difficulty && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Tag className="h-4 w-4" />
            <span className="capitalize">
              {workout.difficulty.toLowerCase()}
            </span>
          </div>
        )}
        {workout?.estimatedDuration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-4 w-4" />
            <span>~{workout.estimatedDuration} min</span>
          </div>
        )}
      </div>

      {/* Active Workout Conflict Dialog */}
      {conflictModal.isOpen && (
        <ActiveWorkoutConflictDialog
          isOpen={conflictModal.isOpen}
          onClose={() =>
            setConflictModal({
              isOpen: false,
              activeSessionId: "",
              activeWorkoutTitle: "",
            })
          }
          activeSessionId={conflictModal.activeSessionId}
          activeWorkoutTitle={conflictModal.activeWorkoutTitle}
          requestedWorkoutId={conflictModal.requestedWorkoutId}
          requestedWorkoutTitle={conflictModal.requestedWorkoutTitle}
          requestedAssignmentId={conflictModal.requestedAssignmentId}
        />
      )}
    </div>
  );
};
