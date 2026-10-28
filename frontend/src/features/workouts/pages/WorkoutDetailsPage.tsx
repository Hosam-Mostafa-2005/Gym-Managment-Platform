import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Layers,
  Sparkles,
  Pencil,
  Play,
  Calendar,
  User,
  ListOrdered,
  AlertCircle,
  Loader2,
  Copy,
  UserPlus,
  Share2,
} from "lucide-react";

import { useWorkout } from "@/features/workouts/hooks/useWorkout";
import { useDuplicateWorkout } from "@/features/workouts/hooks/useDuplicateWorkout";
import { useStartWorkoutSession } from "@/features/workout-sessions/hooks/useStartWorkoutSession";
import { useCurrentWorkoutSession } from "@/features/workout-sessions/hooks/useCurrentWorkoutSession";
import ScheduleWorkoutDialog from "@/features/workout-sessions/components/ScheduleWorkoutDialog";
import ActiveWorkoutConflictDialog from "@/features/workout-sessions/components/ActiveWorkoutConflictDialog";
import ShareWorkoutDialog from "../components/ShareWorkoutDialog";
import { toast } from "sonner";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";
import type { WorkoutExerciseDetails } from "@/features/workouts/types/workout.types";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

export default function WorkoutDetailsPage() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.TRAINER;

  // Fetch workout data using custom query hook
  const { data: workout, isLoading, isError } = useWorkout(workoutId || "");

  const { mutate: duplicateWorkout, isPending: isDuplicating } =
    useDuplicateWorkout();
  const { mutate: startSession, isPending: isStartingSession } =
    useStartWorkoutSession();
  const { data: currentSessionData } = useCurrentWorkoutSession();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    activeSessionId: string;
    activeWorkoutTitle: string;
    requestedWorkoutId?: string;
    requestedWorkoutTitle?: string;
  }>({
    isOpen: false,
    activeSessionId: "",
    activeWorkoutTitle: "",
  });

  const ownerId =
    typeof workout?.createdBy === "object"
      ? workout?.createdBy?.id
      : workout?.createdById || workout?.createdBy;
  const isOwner = Boolean(user?.id && ownerId === user.id);
  const canEdit = canManage || isOwner;
  const canAssign =
    canManage &&
    (user?.role === ROLES.ADMIN || isOwner || Boolean(workout?.isTemplate));

  const handleStartSession = () => {
    if (!workoutId) return;

    const active = currentSessionData?.session;
    if (active && active.status === "IN_PROGRESS") {
      const activeWorkoutId = active.workout?.id || (active as any).workoutId;
      if (activeWorkoutId === workoutId) {
        toast.success("You already have an active workout. Resuming your session.");
        navigate("/sessions/active");
        return;
      }

      setConflictModal({
        isOpen: true,
        activeSessionId: active.id,
        activeWorkoutTitle: active.workout?.title || "Active Workout",
        requestedWorkoutId: workoutId,
        requestedWorkoutTitle: workout?.title || "Selected Workout",
      });
      return;
    }

    startSession(
      { workout: workoutId },
      {
        onSuccess: () => {
          navigate("/sessions/active");
        },
        onError: (err: any) => {
          const conflictData = err?.response?.data?.data;
          if (err?.response?.status === 409 && conflictData?.activeSessionId) {
            setConflictModal({
              isOpen: true,
              activeSessionId: conflictData.activeSessionId,
              activeWorkoutTitle: conflictData.activeWorkoutTitle || "Active Workout",
              requestedWorkoutId: workoutId,
              requestedWorkoutTitle: workout?.title || "Selected Workout",
            });
          } else {
            toast.error(err?.response?.data?.message || "Failed to start workout session.");
          }
        },
      },
    );
  };

  const handleDuplicate = () => {
    if (!workoutId) return;
    duplicateWorkout(
      { id: workoutId },
      {
        onSuccess: (newWorkout) => {
          navigate(`/workout-builder/${newWorkout.id}`);
        },
      },
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                                LOADING SKELETON                            */
  /* -------------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24 flex flex-col items-center justify-center text-[#6B7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="mt-4 text-sm font-medium">Loading workout details...</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               ERROR / NOT FOUND                            */
  /* -------------------------------------------------------------------------- */
  if (isError || !workout) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24">
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-12 text-center backdrop-blur-sm max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400 border border-red-900/50 mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Workout Not Found
            </h2>
            <p className="mt-2 text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              The workout routine you are looking for does not exist or has been
              archived.
            </p>
            <button
              onClick={() => navigate("/workout-builder")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                MAIN DETAILS VIEW                           */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            {/* Breadcrumb & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/workout-builder")}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                Workouts
              </button>

              <span className="text-[#1E2329]">/</span>

              <span className="inline-flex items-center gap-1 rounded bg-[#16291D] border border-[#23422E] px-2.5 py-0.5 text-[11px] font-medium text-[#5BE584] capitalize">
                <Sparkles className="h-3 w-3" />
                {workout.category}
              </span>

              <span className="inline-flex items-center rounded bg-[#1E2329] px-2.5 py-0.5 text-[11px] font-medium text-[#D1D5DB] capitalize">
                {workout.difficulty}
              </span>

              {workout.isTemplate && (
                <span className="inline-flex items-center gap-1 rounded bg-[#1E2329] border border-[#1E2329] px-2.5 py-0.5 text-[11px] font-medium text-[#9CA3AF]">
                  <Layers className="h-3 w-3 text-[#5BE584]" /> Template
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                {workout.title}
              </h1>
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-2xl">
                {workout.description ||
                  "No detailed description provided for this workout routine."}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2.5 self-end lg:self-start">
            {canAssign && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/assignments/new?workoutId=${workoutId}`, {
                    state: { workoutId },
                  })
                }
                className="inline-flex items-center gap-2 rounded-md border border-[#23422E] bg-[#16291D] px-4 py-2 text-xs font-semibold text-[#5BE584] transition-colors hover:bg-[#1F3A29]"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign Workout
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(`/workout-builder/${workoutId}/edit`)}
                className="inline-flex items-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Routine
              </button>
            )}

            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="inline-flex items-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white disabled:opacity-50"
            >
              <Copy className="h-3.5 w-3.5" />
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
            >
              <Calendar className="h-3.5 w-3.5 text-[#5BE584]" />
              Schedule
            </button>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-[#5BE584]/30 bg-[#16291D]/50 px-4 py-2 text-xs font-semibold text-[#5BE584] transition-colors hover:bg-[#5BE584]/20"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>

            <button
              type="button"
              onClick={handleStartSession}
              disabled={isStartingSession}
              className="inline-flex items-center gap-2 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014] disabled:opacity-50"
            >
              {isStartingSession ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              {isStartingSession ? "Starting..." : "Start Session"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        {/* Metadata Overview Cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Overview Metrics
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-4 flex items-center gap-4 transition-colors hover:border-[#2A313A]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Estimated Duration
                </p>
                <p className="text-base font-semibold text-white mt-0.5">
                  ~{workout.estimatedDuration} mins
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-4 flex items-center gap-4 transition-colors hover:border-[#2A313A]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Total Exercises
                </p>
                <p className="text-base font-semibold text-white mt-0.5">
                  {workout.exercises?.length || 0} Movements
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-4 flex items-center gap-4 transition-colors hover:border-[#2A313A]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E2329] border border-[#1E2329] text-[#9CA3AF]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Created By
                </p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate max-w-[140px]">
                  {workout.createdBy?.name || "Personal Workout"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-4 flex items-center gap-4 transition-colors hover:border-[#2A313A]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E2329] border border-[#1E2329] text-[#9CA3AF]">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Last Updated
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {workout.updatedAt
                    ? new Date(workout.updatedAt).toLocaleDateString()
                    : "Recently"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        {/* Exercise Sequence Table */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase flex items-center gap-2">
              <ListOrdered className="h-3.5 w-3.5 text-[#5BE584]" />
              Sequence Details
            </h2>
            <span className="text-[10px] font-mono text-[#6B7280]">
              ID: {workout.id}
            </span>
          </div>

          <div className="rounded-xl border border-[#1E2329] bg-[#101418]/50 overflow-hidden backdrop-blur-sm">
            {!workout.exercises || workout.exercises.length === 0 ? (
              <div className="p-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291D] text-[#5BE584] border border-[#23422E] mx-auto mb-4">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  No exercises configured
                </h3>
                <p className="mt-1 text-xs text-[#9CA3AF] max-w-xs mx-auto">
                  No exercises have been added to this workout sequence yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1E2329]">
                {workout.exercises.map(
                  (item: WorkoutExerciseDetails, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-4 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#1E2329]/30 transition-colors"
                    >
                      {/* LEFT: Index, Exercise Info & Target Parameters */}
                      <div className="flex flex-1 flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#1E2329] bg-[#101418] font-mono text-xs font-bold text-[#5BE584]">
                            {(item.order || idx + 1).toString().padStart(2, "0")}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                              {item.exercise?.name || "Custom Exercise"}
                            </h4>
                            <p className="text-xs text-[#9CA3AF] capitalize">
                              {Array.isArray(item.exercise?.equipment)
                                ? item.exercise.equipment.join(", ")
                                : item.exercise?.equipment || "Barbell"}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-[#5BE584] bg-[#16291D] border border-[#23422E] rounded px-2 py-0.5 mt-1 inline-block">
                                Note: {item.notes}
                              </p>
                            )}
                            {Array.isArray((item as any).setsDetail) &&
                              (item as any).setsDetail.some(
                                (s: any) =>
                                  s.setType === "DROP_SET" ||
                                  s.setType === "REST_PAUSE",
                              ) && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {(item as any).setsDetail.map((s: any) => {
                                    if (s.setType === "DROP_SET") {
                                      return (
                                        <span
                                          key={s.setNumber}
                                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        >
                                          Set {s.setNumber}: Drop Set ({s.stages?.length || 2} stages)
                                        </span>
                                      );
                                    }
                                    if (s.setType === "REST_PAUSE") {
                                      return (
                                        <span
                                          key={s.setNumber}
                                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                        >
                                          Set {s.setNumber}: Rest-Pause ({s.stages?.length || 2} efforts)
                                        </span>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Target Parameters Grid */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start md:self-center bg-[#101418] border border-[#1E2329] rounded-lg px-4 py-2 text-center shrink-0">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                              Sets
                            </span>
                            <span className="text-xs font-semibold text-white font-mono">
                              {item.sets}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                              Reps
                            </span>
                            <span className="text-xs font-semibold text-white font-mono">
                              {item.reps}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                              Rest
                            </span>
                            <span className="text-xs font-semibold text-[#5BE584] font-mono">
                              {item.restSeconds}s
                            </span>
                          </div>
                          {item.targetWeight != null && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                                Target Load
                              </span>
                              <span className="text-xs font-semibold text-white font-mono">
                                {item.targetWeight} kg
                              </span>
                            </div>
                          )}
                          {item.targetRpe != null && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                                Target RPE
                              </span>
                              <span className="text-xs font-semibold text-[#5BE584] font-mono">
                                RPE {item.targetRpe}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT: Framed Exercise Image */}
                      <ExerciseImage
                        src={item.exercise?.imageUrl}
                        alt={item.exercise?.name || "Exercise"}
                        size="lg"
                        fit="contain"
                      />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Schedule Workout Dialog */}
      {isScheduleOpen && workout && (
        <ScheduleWorkoutDialog
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          workoutId={workout.id}
          workoutTitle={workout.title}
        />
      )}

      {/* Share Workout Dialog */}
      {isShareOpen && workout && (
        <ShareWorkoutDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          workoutId={workout.id}
          workoutTitle={workout.title}
        />
      )}

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
        />
      )}
    </div>
  );
}
