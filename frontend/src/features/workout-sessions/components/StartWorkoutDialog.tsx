import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  X,
  Search,
  Dumbbell,
  Plus,
  Play,
  RotateCcw,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Bookmark,
  Calendar,
  CheckCircle2,
  Activity,
  Flame,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useMyAssignments } from "../hooks/useMyAssignments";
import { useWorkoutSessions } from "../hooks/useWorkoutSessions";
import { useCurrentWorkoutSession } from "../hooks/useCurrentWorkoutSession";
import { useStartWorkoutSession } from "../hooks/useStartWorkoutSession";
import ActiveWorkoutConflictDialog from "./ActiveWorkoutConflictDialog";

interface StartWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "personal" | "assigned" | "templates" | "repeat";

interface EligibleWorkoutItem {
  id: string;
  workoutId: string;
  assignmentId?: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  exerciseCount: number;
  imageUrl?: string | null;
  sourceType: "assigned" | "personal" | "template" | "repeat";
  sourceLabel: string;
  trainerName?: string;
  lastCompletedDate?: string;
  lastVolume?: number;
  lastDuration?: number;
}

export const StartWorkoutDialog: React.FC<StartWorkoutDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { data: userFromQuery } = useCurrentUser();
  const userFromStore = useAuthStore((state) => state.user);
  const user = userFromQuery || userFromStore;
  const currentUserId = user?.id || (user as any)?._id;

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null);

  // Queries
  const { data: currentSessionData } = useCurrentWorkoutSession();
  const { data: workouts = [], isLoading: isLoadingWorkouts } = useWorkouts();
  const { data: assignments = [], isLoading: isLoadingAssignments } =
    useMyAssignments();
  const { data: sessionHistoryData, isLoading: isLoadingSessions } =
    useWorkoutSessions(1, 50);

  const { mutate: startWorkout } = useStartWorkoutSession();

  // Conflict modal state
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

  const activeSession = currentSessionData?.session;
  const hasActiveSession = Boolean(
    activeSession && activeSession.status === "IN_PROGRESS",
  );
  const activeWorkoutTitle =
    activeSession?.workout?.title ||
    activeSession?.assignment?.workout?.title ||
    "Active Workout";

  // Build eligible workout lists
  const eligibleItems = useMemo<EligibleWorkoutItem[]>(() => {
    const items: EligibleWorkoutItem[] = [];
    const assignedWorkoutIds = new Set<string>();

    // 1. Coach Assigned Workouts (highest priority for members)
    const activeAssignments = (assignments || []).filter(
      (a: any) => a.status === "ACTIVE" && a.workout,
    );
    for (const a of activeAssignments) {
      const wId = a.workout.id || a.workout._id;
      if (!wId) continue;
      assignedWorkoutIds.add(wId);
      items.push({
        id: `assignment-${a.id}`,
        workoutId: wId,
        assignmentId: a.id,
        title: a.workout.title,
        description: a.workout.description,
        category: a.workout.category || "Strength",
        difficulty: a.workout.difficulty || "Intermediate",
        estimatedDuration: a.workout.estimatedDuration || 45,
        exerciseCount:
          a.workout.exerciseCount || a.workout.exercises?.length || 0,
        imageUrl:
          a.workout.imageUrl ||
          a.workout.exercises?.[0]?.exercise?.imageUrl ||
          null,
        sourceType: "assigned",
        sourceLabel: a.trainer?.name
          ? `Coach Assigned (${a.trainer.name})`
          : "Coach Assigned",
        trainerName: a.trainer?.name,
      });
    }

    // 2. Personal Workouts & Platform Templates
    const rawWorkouts = Array.isArray(workouts)
      ? workouts
      : (workouts as any)?.workouts || [];

    for (const w of rawWorkouts) {
      if (w.isActive === false) continue;
      const wId = w.id || w._id;
      if (!wId) continue;

      const creatorId =
        typeof w.createdBy === "object" && w.createdBy !== null
          ? w.createdBy.id || w.createdBy._id
          : typeof w.creator === "object" && w.creator !== null
            ? w.creator.id || w.creator._id
            : w.createdById || w.createdBy || (w as any).userId;

      const isOwner = Boolean(
        currentUserId &&
          creatorId &&
          String(creatorId).toLowerCase() === String(currentUserId).toLowerCase(),
      );

      if (w.isTemplate) {
        items.push({
          id: `template-${wId}`,
          workoutId: wId,
          title: w.title,
          description: w.description,
          category: w.category || "General",
          difficulty: w.difficulty || "All Levels",
          estimatedDuration: w.estimatedDuration || 45,
          exerciseCount: w.exerciseCount || w.exercises?.length || 0,
          imageUrl: w.imageUrl || null,
          sourceType: "template",
          sourceLabel: "Platform Template",
        });
      } else {
        // It's a personal routine: either current user is owner, or it's a personal routine returned for this member that's not a coach assignment
        const isPersonal = isOwner || !assignedWorkoutIds.has(wId);
        if (isPersonal) {
          items.push({
            id: `personal-${wId}`,
            workoutId: wId,
            title: w.title,
            description: w.description,
            category: w.category || "Strength",
            difficulty: w.difficulty || "Intermediate",
            estimatedDuration: w.estimatedDuration || 45,
            exerciseCount: w.exerciseCount || w.exercises?.length || 0,
            imageUrl: w.imageUrl || null,
            sourceType: "personal",
            sourceLabel: "Personal Routine",
          });
        }
      }
    }

    // 3. Previously Completed Workouts (Unique History Replay)
    const historySessions = sessionHistoryData?.sessions || [];
    const completedHistory = historySessions.filter(
      (s) =>
        s.status === "COMPLETED" && (s.workout || s.assignment?.workout),
    );

    const historySeen = new Set<string>();
    for (const s of completedHistory) {
      const wId = s.workout?.id || s.assignment?.workout?.id;
      if (!wId || historySeen.has(wId)) continue;
      historySeen.add(wId);

      const title =
        s.workout?.title ||
        s.assignment?.workout?.title ||
        "Historical Workout";
      const description =
        s.workout?.description || s.assignment?.workout?.description;
      const category =
        s.workout?.category ||
        s.assignment?.workout?.category ||
        "Completed Session";
      const difficulty =
        s.workout?.difficulty ||
        s.assignment?.workout?.difficulty ||
        "Custom";
      const duration = s.workout?.estimatedDuration || s.duration || 45;
      const exerciseCount =
        s.workout?.exerciseCount || s.exercisesCompleted || 0;
      const imageUrl =
        s.workout?.imageUrl || s.assignment?.workout?.imageUrl || null;

      items.push({
        id: `repeat-${s.id}-${wId}`,
        workoutId: wId,
        assignmentId: s.assignment?.id || (s as any).assignmentId || undefined,
        title,
        description,
        category,
        difficulty,
        estimatedDuration: duration,
        exerciseCount,
        imageUrl,
        sourceType: "repeat",
        sourceLabel: "Completed Workout",
        lastCompletedDate: s.endedAt || s.startedAt,
        lastVolume: s.totalVolume,
        lastDuration: s.duration,
      });
    }

    return items;
  }, [assignments, workouts, sessionHistoryData, currentUserId]);

  // Filtered items based on activeTab and searchQuery
  const filteredItems = useMemo(() => {
    return eligibleItems.filter((item) => {
      // Tab filter
      if (activeTab === "personal") return item.sourceType === "personal";
      if (activeTab === "assigned") return item.sourceType === "assigned";
      if (activeTab === "templates") return item.sourceType === "template";
      if (activeTab === "repeat") return item.sourceType === "repeat";

      // If activeTab === "all", show assigned, personal, template, and any standalone repeat
      if (activeTab === "all") {
        if (item.sourceType === "repeat") {
          const alreadyInAll = eligibleItems.some(
            (other) =>
              other.workoutId === item.workoutId &&
              (other.sourceType === "assigned" ||
                other.sourceType === "personal" ||
                other.sourceType === "template"),
          );
          if (alreadyInAll) return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesTrainer = item.trainerName
          ? item.trainerName.toLowerCase().includes(query)
          : false;
        const matchesDesc = item.description
          ? item.description.toLowerCase().includes(query)
          : false;

        return (
          matchesTitle || matchesCategory || matchesTrainer || matchesDesc
        );
      }

      return true;
    });
  }, [eligibleItems, activeTab, searchQuery]);

  // Counts for tab badges
  const counts = useMemo(() => {
    const personalCount = eligibleItems.filter(
      (i) => i.sourceType === "personal",
    ).length;
    const assignedCount = eligibleItems.filter(
      (i) => i.sourceType === "assigned",
    ).length;
    const templatesCount = eligibleItems.filter(
      (i) => i.sourceType === "template",
    ).length;
    const repeatCount = eligibleItems.filter(
      (i) => i.sourceType === "repeat",
    ).length;

    const allCount = eligibleItems.filter((item) => {
      if (item.sourceType === "repeat") {
        const alreadyInAll = eligibleItems.some(
          (other) =>
            other.workoutId === item.workoutId &&
            (other.sourceType === "assigned" ||
              other.sourceType === "personal" ||
              other.sourceType === "template"),
        );
        return !alreadyInAll;
      }
      return true;
    }).length;

    return {
      all: allCount,
      personal: personalCount,
      assigned: assignedCount,
      templates: templatesCount,
      repeat: repeatCount,
    };
  }, [eligibleItems]);

  const handleStartWorkout = (item: EligibleWorkoutItem) => {
    // 1. Check if user already has an active workout session running
    if (hasActiveSession && activeSession) {
      const activeWorkoutId =
        activeSession.workout?.id || (activeSession as any).workoutId;

      if (activeWorkoutId === item.workoutId) {
        toast.success(
          "You already have this workout in progress. Resuming your session.",
        );
        onClose();
        navigate("/sessions/active");
        return;
      }

      // Conflict: prompt user to resume or cancel
      setConflictModal({
        isOpen: true,
        activeSessionId: activeSession.id,
        activeWorkoutTitle: activeWorkoutTitle,
        requestedWorkoutId: item.workoutId,
        requestedWorkoutTitle: item.title,
        requestedAssignmentId: item.assignmentId,
      });
      return;
    }

    // 2. Start workout session
    setStartingWorkoutId(item.id);
    const payload = item.assignmentId
      ? { assignment: item.assignmentId }
      : { workout: item.workoutId };

    startWorkout(payload, {
      onSuccess: () => {
        setStartingWorkoutId(null);
        onClose();
        navigate("/sessions/active");
      },
      onError: (err: any) => {
        setStartingWorkoutId(null);
        const conflictData = err?.response?.data?.data;
        if (err?.response?.status === 409 && conflictData?.activeSessionId) {
          setConflictModal({
            isOpen: true,
            activeSessionId: conflictData.activeSessionId,
            activeWorkoutTitle:
              conflictData.activeWorkoutTitle || "Active Workout",
            requestedWorkoutId: item.workoutId,
            requestedWorkoutTitle: item.title,
            requestedAssignmentId: item.assignmentId,
          });
        } else {
          toast.error(
            err?.response?.data?.message || "Failed to start workout session.",
          );
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100dvh-2rem)]"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#1E2329] bg-[#101418]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5BE584] uppercase tracking-wider mb-1">
                  <Flame className="w-4 h-4" />
                  <span>Choose Your Workout</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Start Workout Session
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Select an assigned program, personal routine, platform template,
                  or repeat a completed session from your history.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#1E2329] bg-[#090B0F] p-2 text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Session Warning Banner (if one exists) */}
            {hasActiveSession && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    <span className="font-semibold text-white">
                      Active Workout in Progress:
                    </span>{" "}
                    {activeWorkoutTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/sessions/active");
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5BE584] text-[#090B0F] text-xs font-bold hover:bg-[#4ade80] transition-colors"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Resume Live</span>
                </button>
              </div>
            )}

            {/* Filter Bar & Tabs */}
            <div className="p-6 pb-3 space-y-4 border-b border-[#1E2329]/60">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workouts by name, category, or coach..."
                  className="w-full bg-[#101418] border border-[#1E2329] rounded-xl h-10 pl-10 pr-4 text-xs text-white placeholder-[#6B7280] transition-colors focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                    activeTab === "all"
                      ? "bg-[#5BE584] text-[#090B0F] border-[#5BE584]"
                      : "bg-[#101418] text-[#9CA3AF] border-[#1E2329] hover:text-white hover:border-[#2A313A]"
                  }`}
                >
                  <span>All Eligible</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "all"
                        ? "bg-[#090B0F]/20 text-[#090B0F]"
                        : "bg-[#1E2329] text-[#9CA3AF]"
                    }`}
                  >
                    {counts.all}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("assigned")}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                    activeTab === "assigned"
                      ? "bg-[#5BE584] text-[#090B0F] border-[#5BE584]"
                      : "bg-[#101418] text-[#9CA3AF] border-[#1E2329] hover:text-white hover:border-[#2A313A]"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Coach Assigned</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "assigned"
                        ? "bg-[#090B0F]/20 text-[#090B0F]"
                        : "bg-[#1E2329] text-[#9CA3AF]"
                    }`}
                  >
                    {counts.assigned}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("personal")}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                    activeTab === "personal"
                      ? "bg-[#5BE584] text-[#090B0F] border-[#5BE584]"
                      : "bg-[#101418] text-[#9CA3AF] border-[#1E2329] hover:text-white hover:border-[#2A313A]"
                  }`}
                >
                  <Dumbbell className="h-3.5 w-3.5" />
                  <span>Personal Routines</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "personal"
                        ? "bg-[#090B0F]/20 text-[#090B0F]"
                        : "bg-[#1E2329] text-[#9CA3AF]"
                    }`}
                  >
                    {counts.personal}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("templates")}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                    activeTab === "templates"
                      ? "bg-[#5BE584] text-[#090B0F] border-[#5BE584]"
                      : "bg-[#101418] text-[#9CA3AF] border-[#1E2329] hover:text-white hover:border-[#2A313A]"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Templates</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "templates"
                        ? "bg-[#090B0F]/20 text-[#090B0F]"
                        : "bg-[#1E2329] text-[#9CA3AF]"
                    }`}
                  >
                    {counts.templates}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("repeat")}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                    activeTab === "repeat"
                      ? "bg-[#5BE584] text-[#090B0F] border-[#5BE584]"
                      : "bg-[#101418] text-[#9CA3AF] border-[#1E2329] hover:text-white hover:border-[#2A313A]"
                  }`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Repeat Previous</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "repeat"
                        ? "bg-[#090B0F]/20 text-[#090B0F]"
                        : "bg-[#1E2329] text-[#9CA3AF]"
                    }`}
                  >
                    {counts.repeat}
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Workout List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3.5 max-h-[58vh]">
              {isLoadingWorkouts || isLoadingAssignments || isLoadingSessions ? (
                <div className="py-16 text-center text-xs text-[#9CA3AF]">
                  Loading eligible workouts...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center px-4">
                  <div className="p-3.5 rounded-2xl bg-[#16291D] border border-[#23422E] text-[#5BE584] mb-3.5 shadow-sm">
                    <Dumbbell className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {searchQuery ? "No matching workouts found" : "No workouts available"}
                  </h4>
                  <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-md leading-relaxed">
                    {searchQuery
                      ? `No workouts match "${searchQuery}". Try adjusting your keywords or clearing the active filter.`
                      : activeTab === "assigned"
                        ? "You do not have any coach-assigned workouts at this time. You can build your own custom training routine or ask your coach for a program."
                        : activeTab === "personal"
                          ? "You haven't built any personal routines yet. Create your first custom workout to start training independently."
                          : activeTab === "repeat"
                            ? "You have not completed any workout sessions yet to replay."
                            : "No workout routines are currently available in this category."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/workout-builder");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2.5 text-xs font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.22)] hover:bg-[#49D472] transition-all"
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      <span>Create Workout</span>
                    </button>

                    {(searchQuery || activeTab !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveTab("all");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isStarting = startingWorkoutId === item.id;
                  const isRepeat = item.sourceType === "repeat";

                  return (
                    <div
                      key={item.id}
                      className="group rounded-2xl border border-[#1E2329] bg-[#101418] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2A313A] transition-all hover:bg-[#12171E]"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Thumbnail with Athletic Fallback */}
                        <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden border border-[#1E2329] bg-[#090B0F] flex items-center justify-center relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                if (target.parentElement) {
                                  target.parentElement.innerHTML = `
                                    <div class="flex flex-col items-center justify-center p-2 text-center w-full h-full bg-[#12171E]">
                                      <div class="p-1.5 rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] mb-0.5">
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-center w-full h-full bg-gradient-to-br from-[#12171E] to-[#0A0D11]">
                              <div className="p-1.5 rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] mb-0.5">
                                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Workout Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                item.sourceType === "assigned"
                                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                  : item.sourceType === "personal"
                                    ? "bg-[#16291D] border-[#23422E] text-[#5BE584]"
                                    : item.sourceType === "repeat"
                                      ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
                                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}
                            >
                              {item.sourceLabel}
                            </span>

                            <span className="text-[10px] font-medium text-[#9CA3AF] bg-[#1E2329] px-2 py-0.5 rounded-md capitalize">
                              {item.category}
                            </span>

                            <span className="text-[10px] font-medium text-[#9CA3AF] bg-[#1E2329] px-2 py-0.5 rounded-md capitalize">
                              {item.difficulty}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight break-words group-hover:text-[#5BE584] transition-colors">
                            {item.title}
                          </h3>

                          {/* Description if present */}
                          {item.description && (
                            <p className="text-xs text-[#9CA3AF] line-clamp-1">
                              {item.description}
                            </p>
                          )}

                          {/* Stats / Historical Context */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF] pt-0.5">
                            {item.exerciseCount > 0 && (
                              <span className="flex items-center gap-1 font-mono">
                                <Layers className="h-3 w-3 text-[#5BE584]" />
                                {item.exerciseCount} Exercises
                              </span>
                            )}

                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3 text-[#5BE584]" />
                              ~{item.estimatedDuration}m
                            </span>

                            {/* Repeat Workout context */}
                            {isRepeat && item.lastCompletedDate && (
                              <span className="flex items-center gap-1 text-purple-400 font-mono text-[11px] bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/15">
                                <RotateCcw className="h-3 w-3" />
                                Last done:{" "}
                                {new Date(item.lastCompletedDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                                {item.lastVolume
                                  ? ` • ${item.lastVolume} kg`
                                  : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Start / Repeat Button */}
                      <div className="sm:self-center shrink-0">
                        <button
                          type="button"
                          disabled={isStarting}
                          onClick={() => handleStartWorkout(item)}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
                            isRepeat
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "bg-[#5BE584] hover:bg-[#4ade80] text-[#090B0F]"
                          }`}
                        >
                          {isStarting ? (
                            <span>Starting...</span>
                          ) : isRepeat ? (
                            <>
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Repeat Workout</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Start Workout</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#1E2329] bg-[#090B0F] flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>
                Showing {filteredItems.length} of {eligibleItems.length} eligible
                workouts
              </span>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Active Workout Conflict Dialog */}
      <ActiveWorkoutConflictDialog
        isOpen={conflictModal.isOpen}
        onClose={() =>
          setConflictModal((prev) => ({ ...prev, isOpen: false }))
        }
        activeSessionId={conflictModal.activeSessionId}
        activeWorkoutTitle={conflictModal.activeWorkoutTitle}
        requestedWorkoutId={conflictModal.requestedWorkoutId}
        requestedWorkoutTitle={conflictModal.requestedWorkoutTitle}
        requestedAssignmentId={conflictModal.requestedAssignmentId}
      />
    </>
  );
};

export default StartWorkoutDialog;
