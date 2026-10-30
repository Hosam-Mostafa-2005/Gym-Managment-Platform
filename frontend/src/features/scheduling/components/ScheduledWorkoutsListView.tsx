// src/features/scheduling/components/ScheduledWorkoutsListView.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Dumbbell,
  User,
  Play,
  RotateCcw,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ArrowUpDown,
  Filter,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  ScheduledWorkout,
  CoachingAppointment,
  ScheduledWorkoutStatus,
} from "../types/scheduling.types";
import {
  useStartScheduledWorkout,
  useCancelScheduledWorkout,
  useCancelCoachScheduledWorkout,
} from "../hooks/useScheduling";

interface ScheduledWorkoutsListViewProps {
  scheduledWorkouts: ScheduledWorkout[];
  isLoading?: boolean;
  isCoachView?: boolean;
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onRescheduleWorkout?: (workout: ScheduledWorkout) => void;
  onNewSchedule?: () => void;
  coachingAppointments?: CoachingAppointment[];
  onSelectAppointment?: (appointment: CoachingAppointment) => void;
}

type SortOrder = "date-asc" | "date-desc" | "name-asc";

export default function ScheduledWorkoutsListView({
  scheduledWorkouts,
  isLoading = false,
  isCoachView = false,
  onSelectWorkout,
  onRescheduleWorkout,
  onNewSchedule,
}: ScheduledWorkoutsListViewProps) {
  const { t, i18n } = useTranslation("trainingCalendar");
  const navigate = useNavigate();

  // Local state for table presentation concerns
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-asc");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Shared mutations
  const { mutate: startWorkout, isPending: isStarting } =
    useStartScheduledWorkout();
  const { mutate: cancelMemberWorkout, isPending: isCancellingMember } =
    useCancelScheduledWorkout();
  const { mutate: cancelCoachWorkout, isPending: isCancellingCoach } =
    useCancelCoachScheduledWorkout();

  const isCancelling = isCancellingMember || isCancellingCoach;

  // Formatting helpers matching Calendar view
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(i18n.language === "ar" ? "ar-EG" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  // Status Badge Component
  const renderStatusBadge = (status: ScheduledWorkoutStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-[#5BE584] border border-[#5BE584]/20">
            <CheckCircle2 size={12} />
            {t("status.completed")}
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={12} />
            {t("status.missed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <XCircle size={12} />
            {t("status.cancelled")}
          </span>
        );
      case "RESCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw size={12} />
            {t("status.rescheduled")}
          </span>
        );
      case "SCHEDULED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock size={12} />
            {t("status.scheduled")}
          </span>
        );
    }
  };

  // Avatar bubble helper
  const renderMemberAvatar = (
    name?: string,
    avatarUrl?: string | null,
    size = "size-7",
  ) => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name || "Member"}
          className={`${size} rounded-full object-cover border border-[#2A3039] flex-shrink-0`}
        />
      );
    }

    const initials = (name || "Member")
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        className={`${size} rounded-full bg-[#1A212B] border border-[#2A3039] text-[11px] font-bold text-[#5BE584] flex items-center justify-center flex-shrink-0`}
      >
        {initials}
      </div>
    );
  };

  // Filter & Sort
  const processedWorkouts = useMemo(() => {
    return scheduledWorkouts
      .filter((sw) => {
        // Status filter
        if (statusFilter !== "ALL" && sw.status !== statusFilter) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (sw.workout?.title || "").toLowerCase();
          const memberName = (sw.member?.name || "").toLowerCase();
          const coachName = (sw.trainer?.name || "").toLowerCase();
          const notes = (sw.notes || "").toLowerCase();
          if (
            !title.includes(q) &&
            !memberName.includes(q) &&
            !coachName.includes(q) &&
            !notes.includes(q)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "date-asc") {
          return (
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
          );
        }
        if (sortOrder === "date-desc") {
          return (
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          );
        }
        if (sortOrder === "name-asc") {
          const nameA = a.workout?.title || "";
          const nameB = b.workout?.title || "";
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [scheduledWorkouts, statusFilter, searchQuery, sortOrder]);

  // Action Handlers
  const handleStart = (e: React.MouseEvent, workoutId: string) => {
    e.stopPropagation();
    startWorkout(workoutId, {
      onSuccess: (session: any) => {
        if (session?.id) {
          navigate(`/sessions/${session.id}/active`);
        } else {
          navigate("/sessions/active");
        }
      },
    });
  };

  const handleConfirmCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isCoachView) {
      cancelCoachWorkout(
        { id, reason: "Cancelled from list view" },
        {
          onSettled: () => setCancellingId(null),
        },
      );
    } else {
      cancelMemberWorkout(id, {
        onSettled: () => setCancellingId(null),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101418] border border-[#1E2329] p-3.5 rounded-2xl shadow-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("list.searchPlaceholder")}
            className="w-full bg-[#161B22] border border-[#1E2329] rounded-xl pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#5BE584] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs px-1"
            >
              {t("list.clearSearch")}
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#161B22] border border-[#1E2329] rounded-xl px-2.5 py-1.5 text-xs">
            <Filter size={13} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#161B22]">
                {t("list.allStatuses")}
              </option>
              <option value="SCHEDULED" className="bg-[#161B22]">
                {t("status.scheduled")}
              </option>
              <option value="RESCHEDULED" className="bg-[#161B22]">
                {t("status.rescheduled")}
              </option>
              <option value="COMPLETED" className="bg-[#161B22]">
                {t("status.completed")}
              </option>
              <option value="MISSED" className="bg-[#161B22]">
                {t("status.missed")}
              </option>
              <option value="CANCELLED" className="bg-[#161B22]">
                {t("status.cancelled")}
              </option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 bg-[#161B22] border border-[#1E2329] rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown size={13} className="text-gray-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="date-asc" className="bg-[#161B22]">
                {t("list.sortEarliest")}
              </option>
              <option value="date-desc" className="bg-[#161B22]">
                {t("list.sortLatest")}
              </option>
              <option value="name-asc" className="bg-[#161B22]">
                {t("list.sortName")}
              </option>
            </select>
          </div>

          {/* Result Count Badge */}
          <div className="text-[11px] text-gray-400 px-2 py-1 bg-[#161B22] border border-[#1E2329] rounded-xl">
            {processedWorkouts.length === 1
              ? t("list.routineCountSingle")
              : t("list.routineCount", { count: processedWorkouts.length })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#101418] border border-[#1E2329] rounded-2xl">
          <Loader2 size={24} className="animate-spin text-[#5BE584] mx-auto mb-3" />
          <p className="text-xs text-gray-400">{t("list.loading")}</p>
        </div>
      ) : processedWorkouts.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-[#101418] border border-[#1E2329] rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584] mx-auto">
            <Dumbbell size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">
            {t("list.noWorkoutsTitle")}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? t("list.noWorkoutsFilter")
              : t("list.noWorkoutsEmpty")}
          </p>
          {onNewSchedule && (
            <button
              onClick={onNewSchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#49d472] text-[#090B0F] shadow-lg shadow-[#5BE584]/20 transition-all mt-2"
            >
              <Plus size={14} /> {t("list.scheduleAWorkout")}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#1E2329] bg-[#101418] shadow-xl">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-[#1E2329] bg-[#141920] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4">{t("list.colWorkout")}</th>
                  <th className="py-3.5 px-4">{t("list.colMemberCoach")}</th>
                  <th className="py-3.5 px-4">{t("list.colDate")}</th>
                  <th className="py-3.5 px-4">{t("list.colTime")}</th>
                  <th className="py-3.5 px-4">{t("list.colStatus")}</th>
                  <th className="py-3.5 px-4 text-right rtl:text-left">{t("list.colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]/60 text-xs text-gray-300">
                {processedWorkouts.map((sw) => {
                  const today = isToday(sw.scheduledAt);
                  const isCoachAssigned =
                    Boolean(sw.trainerId) && !isCoachView;
                  const canCancel =
                    !isCoachAssigned &&
                    (sw.status === "SCHEDULED" || sw.status === "RESCHEDULED");
                  const canStart =
                    !isCoachView &&
                    (sw.status === "SCHEDULED" ||
                      sw.status === "RESCHEDULED" ||
                      sw.status === "MISSED");
                  const canReschedule =
                    !isCoachAssigned &&
                    (sw.status === "SCHEDULED" ||
                      sw.status === "RESCHEDULED" ||
                      sw.status === "MISSED");

                  return (
                    <tr
                      key={sw.id}
                      onClick={() => onSelectWorkout(sw)}
                      className="hover:bg-[#161B22]/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Workout Name & Metadata */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584] flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Dumbbell size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-[#5BE584] transition-colors truncate max-w-[220px]">
                              {sw.workout?.title || t("events.defaultWorkoutTitle")}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                              {sw.workout?.estimatedDuration && (
                                <span>{t("list.durationMinutes", { count: sw.workout.estimatedDuration })}</span>
                              )}
                              {sw.workout?.difficulty && (
                                <span>• {sw.workout.difficulty}</span>
                              )}
                              {sw.workout?.exercises && (
                                <span>
                                  • {t("list.exerciseCountShort", { count: sw.workout.exercises.length })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Member / Coach Identification */}
                      <td className="py-3.5 px-4">
                        {isCoachView ? (
                          <div
                            onClick={(e) => {
                              if (sw.memberId) {
                                e.stopPropagation();
                                navigate(`/members/${sw.memberId}`);
                              }
                            }}
                            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                            title="View member profile"
                          >
                            {renderMemberAvatar(
                              sw.member?.name,
                              sw.member?.avatarUrl,
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold text-white hover:text-[#5BE584] hover:underline flex items-center gap-1">
                                {sw.member?.name || t("events.athleteLabel", { name: "" })}
                                <ExternalLink size={10} className="opacity-60" />
                              </span>
                              {sw.member?.email && (
                                <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                  {sw.member.email}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {sw.trainer ? (
                              <>
                                {renderMemberAvatar(
                                  sw.trainer.name,
                                  sw.trainer.avatarUrl,
                                )}
                                <div>
                                  <div className="text-white font-medium">
                                    {t("events.coachLabel", { name: sw.trainer.name })}
                                  </div>
                                  <div className="text-[10px] text-purple-400">
                                    {t("events.assignedByCoach")}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-gray-400">
                                <User size={13} className="text-[#5BE584]" />
                                <span>{t("events.personalSchedule")}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 3. Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-white">
                          <Calendar size={13} className="text-[#5BE584]" />
                          <span>{formatDate(sw.scheduledAt)}</span>
                          {today && (
                            <span className="ml-1 rtl:ml-0 rtl:mr-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5BE584]/20 text-[#5BE584]">
                              {t("events.todayBadge")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-200">
                          <Clock size={13} className="text-blue-400" />
                          <span>{formatTime(sw.scheduledAt)}</span>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(sw.status)}
                      </td>

                      {/* 6. Applicable Actions */}
                      <td
                        className="py-3.5 px-4 text-right rtl:text-left whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cancellingId === sw.id ? (
                          <div className="inline-flex items-center gap-2 bg-[#1A212B] p-1.5 rounded-xl border border-rose-500/30">
                            <span className="text-[11px] text-rose-400 font-medium">
                              {t("list.cancelConfirm")}
                            </span>
                            <button
                              onClick={(e) => handleConfirmCancel(e, sw.id)}
                              disabled={isCancelling}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white"
                            >
                              {t("list.yes")}
                            </button>
                            <button
                              onClick={() => setCancellingId(null)}
                              className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white"
                            >
                              {t("list.no")}
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {/* Start Workout Button (Member) */}
                            {canStart && (
                              <button
                                onClick={(e) => handleStart(e, sw.id)}
                                disabled={isStarting}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#5BE584] hover:bg-[#4dd273] text-[#090B0F] shadow-sm transition-all hover:scale-105 active:scale-95"
                                title={t("list.startTitle")}
                              >
                                <Play size={11} className="fill-[#090B0F]" />
                                {t("events.start")}
                              </button>
                            )}

                            {/* Reschedule Button */}
                            {canReschedule && onRescheduleWorkout && (
                              <button
                                onClick={() => onRescheduleWorkout(sw)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                                title={t("list.rescheduleTitle")}
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}

                            {/* View Details */}
                            <button
                              onClick={() => onSelectWorkout(sw)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                              title={t("list.viewDetailsTitle")}
                            >
                              <Eye size={14} />
                            </button>

                            {/* Cancel Button */}
                            {canCancel && (
                              <button
                                onClick={() => setCancellingId(sw.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title={t("list.cancelTitle")}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {processedWorkouts.map((sw) => {
              const today = isToday(sw.scheduledAt);
              const isCoachAssigned =
                Boolean(sw.trainerId) && !isCoachView;
              const canCancel =
                !isCoachAssigned &&
                (sw.status === "SCHEDULED" || sw.status === "RESCHEDULED");
              const canStart =
                !isCoachView &&
                (sw.status === "SCHEDULED" ||
                  sw.status === "RESCHEDULED" ||
                  sw.status === "MISSED");
              const canReschedule =
                !isCoachAssigned &&
                (sw.status === "SCHEDULED" ||
                  sw.status === "RESCHEDULED" ||
                  sw.status === "MISSED");

              return (
                <div
                  key={sw.id}
                  onClick={() => onSelectWorkout(sw)}
                  className="bg-[#101418] border border-[#1E2329] p-4 rounded-2xl shadow-md space-y-3 active:scale-[0.99] transition-transform text-left rtl:text-right"
                >
                  {/* Card Top: Workout Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584] flex-shrink-0">
                        <Dumbbell size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {sw.workout?.title || t("events.defaultWorkoutTitle")}
                        </h4>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          {sw.workout?.estimatedDuration && (
                            <span>{t("list.durationMinutes", { count: sw.workout.estimatedDuration })}</span>
                          )}
                          {sw.workout?.difficulty && (
                            <span>• {sw.workout.difficulty}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {renderStatusBadge(sw.status)}
                    </div>
                  </div>

                  {/* Card Middle: Member Info + Date/Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1E2329]/60 text-xs">
                    {/* Member or Coach Tag */}
                    <div className="flex items-center gap-2 text-gray-300">
                      {isCoachView ? (
                        <div
                          onClick={(e) => {
                            if (sw.memberId) {
                              e.stopPropagation();
                              navigate(`/members/${sw.memberId}`);
                            }
                          }}
                          className="flex items-center gap-2 min-w-0"
                        >
                          {renderMemberAvatar(
                            sw.member?.name,
                            sw.member?.avatarUrl,
                            "size-6",
                          )}
                          <span className="font-semibold text-white truncate hover:underline">
                            {sw.member?.name || t("events.athleteLabel", { name: "" })}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {sw.trainer ? (
                            <>
                              {renderMemberAvatar(
                                sw.trainer.name,
                                sw.trainer.avatarUrl,
                                "size-6",
                              )}
                              <span className="text-purple-400 text-[11px] truncate">
                                {t("events.coachLabel", { name: sw.trainer.name })}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-[11px]">
                              {t("list.personal")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-3 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#5BE584]" />
                        <span>{formatDate(sw.scheduledAt)}</span>
                        {today && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-[#5BE584]/20 text-[#5BE584]">
                            {t("events.todayBadge")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <Clock size={12} className="text-blue-400" />
                        <span>{formatTime(sw.scheduledAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Action Buttons */}
                  <div
                    className="flex items-center justify-between gap-2 pt-2 border-t border-[#1E2329]/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Left: Details */}
                    <button
                      onClick={() => onSelectWorkout(sw)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 bg-[#161B22] border border-[#1E2329] hover:text-white"
                    >
                      <Eye size={13} /> {t("events.details")}
                    </button>

                    {/* Right Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {canReschedule && onRescheduleWorkout && (
                        <button
                          onClick={() => onRescheduleWorkout(sw)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20"
                        >
                          <RotateCcw size={13} className="inline mr-1 rtl:mr-0 rtl:ml-1" />
                          {t("workoutModal.reschedule")}
                        </button>
                      )}

                      {canCancel &&
                        (cancellingId === sw.id ? (
                          <div className="flex items-center gap-1 bg-[#1A212B] p-1 rounded-xl">
                            <button
                              onClick={(e) => handleConfirmCancel(e, sw.id)}
                              disabled={isCancelling}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-rose-600 text-white"
                            >
                              {t("list.confirm")}
                            </button>
                            <button
                              onClick={() => setCancellingId(null)}
                              className="px-1.5 py-1 rounded text-[10px] text-gray-400"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancellingId(sw.id)}
                            className="p-2 rounded-xl text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
                            title={t("list.cancelTitle")}
                          >
                            <Trash2 size={13} />
                          </button>
                        ))}

                      {canStart && (
                        <button
                          onClick={(e) => handleStart(e, sw.id)}
                          disabled={isStarting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5BE584] text-[#090B0F] shadow-sm hover:bg-[#49d472]"
                        >
                          <Play size={12} className="fill-[#090B0F]" />
                          {t("events.start")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
