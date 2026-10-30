// src/features/scheduling/components/ScheduledWorkoutDetailModal.tsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  X,
  Calendar,
  Clock,
  Dumbbell,
  User,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ScheduledWorkout } from "../types/scheduling.types";
import {
  useCancelScheduledWorkout,
  useCancelCoachScheduledWorkout,
  useStartScheduledWorkout,
} from "../hooks/useScheduling";

interface ScheduledWorkoutDetailModalProps {
  scheduledWorkout: ScheduledWorkout | null;
  isOpen: boolean;
  onClose: () => void;
  isCoachView?: boolean;
  onReschedule?: (scheduledWorkout: ScheduledWorkout) => void;
}

export default function ScheduledWorkoutDetailModal({
  scheduledWorkout,
  isOpen,
  onClose,
  isCoachView = false,
  onReschedule,
}: ScheduledWorkoutDetailModalProps) {
  const { t, i18n } = useTranslation("trainingCalendar");
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { mutate: cancelWorkout, isPending: isCancellingMember } =
    useCancelScheduledWorkout();
  const { mutate: cancelCoachWorkout, isPending: isCancellingCoach } =
    useCancelCoachScheduledWorkout();
  const { mutate: startWorkout, isPending: isStarting } =
    useStartScheduledWorkout();

  const isCancelling = isCancellingMember || isCancellingCoach;

  if (!isOpen || !scheduledWorkout) return null;

  const scheduledDate = new Date(scheduledWorkout.scheduledAt);
  const isScheduledByCoach =
    Boolean(scheduledWorkout.trainerId) && !isCoachView;

  const handleStartWorkout = () => {
    startWorkout(scheduledWorkout.id, {
      onSuccess: (session: any) => {
        onClose();
        if (session?.id) {
          navigate(`/sessions/${session.id}/active`);
        } else {
          navigate("/sessions/active");
        }
      },
    });
  };

  const handleCancelWorkout = () => {
    if (isCoachView) {
      cancelCoachWorkout(
        { id: scheduledWorkout.id, reason: "Cancelled by coach" },
        {
          onSuccess: () => {
            setConfirmCancel(false);
            onClose();
          },
        },
      );
    } else {
      cancelWorkout(scheduledWorkout.id, {
        onSuccess: () => {
          setConfirmCancel(false);
          onClose();
        },
      });
    }
  };

  const getStatusBadge = () => {
    switch (scheduledWorkout.status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-[#5BE584] border border-[#5BE584]/20">
            <CheckCircle2 size={13} />
            {t("status.completed")}
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={13} />
            {t("status.missed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <X size={13} />
            {t("status.cancelled")}
          </span>
        );
      case "RESCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw size={13} />
            {t("status.rescheduled")}
          </span>
        );
      case "SCHEDULED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock size={13} />
            {t("status.scheduled")}
          </span>
        );
    }
  };

  const formattedDate = scheduledDate.toLocaleDateString(
    i18n.language === "ar" ? "ar-EG" : "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  const formattedTime = scheduledDate.toLocaleTimeString(
    i18n.language === "ar" ? "ar-EG" : "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left rtl:text-right">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {scheduledWorkout.workout?.title || t("events.defaultWorkoutTitle")}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                  {scheduledWorkout.workout?.difficulty && (
                    <span className="text-xs text-gray-400 capitalize">
                      • {scheduledWorkout.workout.difficulty.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-5">
            {/* Date & Time Banner */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#12161D] border border-[#1E2329] rounded-xl text-sm">
              <div className="flex items-center gap-2.5 text-gray-300">
                <Calendar className="h-4 w-4 text-[#5BE584]" />
                <div>
                  <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    {t("workoutModal.date")}
                  </div>
                  <div className="font-semibold text-white">
                    {formattedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-gray-300">
                <Clock className="h-4 w-4 text-[#5BE584]" />
                <div>
                  <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    {t("workoutModal.time")}
                  </div>
                  <div className="font-semibold text-white">
                    {formattedTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Coach / Athlete Connection Details */}
            {scheduledWorkout.trainer && (
              <div className="flex items-center gap-3 p-3 bg-[#12161D] border border-[#1E2329] rounded-xl">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#5BE584]">
                  <User size={15} />
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">{t("workoutModal.assignedByNotice")}</span>{" "}
                  <span className="font-semibold text-white">
                    {t("events.coachLabel", { name: scheduledWorkout.trainer.name })}
                  </span>
                </div>
              </div>
            )}

            {isCoachView && scheduledWorkout.member && (
              <div className="flex items-center gap-3 p-3 bg-[#12161D] border border-[#1E2329] rounded-xl">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User size={15} />
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">{t("events.athleteLabel", { name: "" })}</span>{" "}
                  <span className="font-semibold text-white">
                    {scheduledWorkout.member.name}
                  </span>
                  <span className="text-gray-500 ml-1 rtl:ml-0 rtl:mr-1">
                    ({scheduledWorkout.member.email})
                  </span>
                </div>
              </div>
            )}

            {/* Coach or Member Notes */}
            {scheduledWorkout.notes && (
              <div className="p-3.5 bg-[#12161D] border border-[#1E2329] rounded-xl text-sm">
                <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-[#5BE584]" />
                  {t("workoutModal.instructionsAndNotes")}
                </div>
                <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                  {scheduledWorkout.notes}
                </p>
              </div>
            )}

            {/* Exercises Preview */}
            {scheduledWorkout.workout?.exercises &&
              scheduledWorkout.workout.exercises.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {t("workoutModal.exercisesTitle", {
                      count: scheduledWorkout.workout.exercises.length,
                    })}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 rtl:pr-0 rtl:pl-1">
                    {scheduledWorkout.workout.exercises.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#12161D] border border-[#1E2329] text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-[#1A212B] text-gray-400 font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-white truncate">
                            {item.exercise?.name || "Exercise"}
                          </span>
                        </div>
                        <div className="flex-shrink-0 text-gray-400 font-medium">
                          {t("workoutModal.setsReps", {
                            sets: item.sets,
                            reps: item.reps,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Coach restriction notice */}
            {isScheduledByCoach && (
              <div className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>
                  {t("workoutModal.coachNotice", {
                    name: scheduledWorkout.trainer?.name,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between p-5 bg-[#12161D] border-t border-[#1E2329]">
            {/* Left Action (Cancel / Delete & Reschedule) */}
            {!confirmCancel ? (
              <div className="flex items-center gap-2">
                {(!isScheduledByCoach || isCoachView) &&
                  (scheduledWorkout.status === "SCHEDULED" ||
                    scheduledWorkout.status === "RESCHEDULED") && (
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                      {t("workoutModal.cancelSchedule")}
                    </button>
                  )}

                {onReschedule &&
                  (!isScheduledByCoach || isCoachView) &&
                  (scheduledWorkout.status === "SCHEDULED" ||
                    scheduledWorkout.status === "RESCHEDULED" ||
                    scheduledWorkout.status === "MISSED") && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onReschedule(scheduledWorkout);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
                    >
                      <RotateCcw size={14} />
                      {t("workoutModal.reschedule")}
                    </button>
                  )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-medium">
                  {t("workoutModal.cancelPrompt")}
                </span>
                <button
                  type="button"
                  onClick={handleCancelWorkout}
                  disabled={isCancelling}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
                >
                  {isCancelling ? t("workoutModal.cancelling") : t("workoutModal.yesCancel")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-white"
                >
                  {t("list.no")}
                </button>
              </div>
            )}

            {/* Right Action: Start Workout */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t("workoutModal.close")}
              </button>

              {!isCoachView &&
                (scheduledWorkout.status === "SCHEDULED" ||
                  scheduledWorkout.status === "RESCHEDULED" ||
                  scheduledWorkout.status === "MISSED") && (
                  <button
                    type="button"
                    onClick={handleStartWorkout}
                    disabled={isStarting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#4dd273] text-black shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <Play size={14} className="fill-black" />
                    {isStarting ? t("workoutModal.starting") : t("workoutModal.startWorkout")}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
