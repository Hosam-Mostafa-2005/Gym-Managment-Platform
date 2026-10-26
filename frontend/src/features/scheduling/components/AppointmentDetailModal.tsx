// src/features/scheduling/components/AppointmentDetailModal.tsx
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserX,
  RotateCcw,
  MessageSquare,
  Lock,
} from "lucide-react";
import type {
  CoachingAppointment,
  AppointmentType,
} from "../types/scheduling.types";
import {
  useCompleteAppointment,
  useMarkNoShowAppointment,
  useCancelAppointment,
} from "../hooks/useScheduling";

interface AppointmentDetailModalProps {
  appointment: CoachingAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  isCoachView?: boolean;
}

const TYPE_LABELS: Record<AppointmentType, string> = {
  CHECK_IN: "Routine Check-In",
  PROGRESS_REVIEW: "Progress & Metrics Review",
  CONSULTATION: "1-on-1 Consultation",
  ASSESSMENT: "Fitness Assessment",
  FORM_ANALYSIS: "Technique & Form Analysis",
  GOAL_SETTING: "Goal Setting & Strategy",
  NUTRITION_SYNC: "Nutrition & Macro Sync",
};

export default function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
  isCoachView = false,
}: AppointmentDetailModalProps) {
  const [actionTab, setActionTab] = useState<"detail" | "complete" | "cancel">(
    "detail",
  );
  const [completeNotes, setCompleteNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { mutate: completeAppt, isPending: isCompleting } =
    useCompleteAppointment();
  const { mutate: markNoShow, isPending: isMarkingNoShow } =
    useMarkNoShowAppointment();
  const { mutate: cancelAppt, isPending: isCancelling } = useCancelAppointment();

  if (!isOpen || !appointment) return null;

  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    completeAppt(
      {
        id: appointment.id,
        payload: { coachNotes: completeNotes.trim() || undefined },
      },
      {
        onSuccess: () => {
          setActionTab("detail");
          onClose();
        },
      },
    );
  };

  const handleMarkNoShow = () => {
    if (window.confirm("Are you sure you want to mark this member as a no-show?")) {
      markNoShow(
        { id: appointment.id },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    cancelAppt(
      {
        id: appointment.id,
        payload: { reason: cancelReason.trim() },
      },
      {
        onSuccess: () => {
          setActionTab("detail");
          onClose();
        },
      },
    );
  };

  const getStatusBadge = () => {
    switch (appointment.status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-[#5BE584] border border-[#5BE584]/20">
            <CheckCircle2 size={13} />
            Completed
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UserX size={13} />
            No Show
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <X size={13} />
            Cancelled
          </span>
        );
      case "RESCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw size={13} />
            Rescheduled
          </span>
        );
      case "SCHEDULED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock size={13} />
            Scheduled
          </span>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {appointment.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                  <span className="text-xs text-purple-400 font-medium">
                    • {TYPE_LABELS[appointment.type] || appointment.type}
                  </span>
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

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {actionTab === "detail" && (
              <>
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#12161D] border border-[#1E2329] rounded-xl text-sm">
                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                        Date
                      </div>
                      <div className="font-semibold text-white">
                        {startDate.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-300">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                        Time Slot
                      </div>
                      <div className="font-semibold text-white">
                        {startDate.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {endDate.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counterparty & Location */}
                <div className="space-y-2">
                  {appointment.trainer && !isCoachView && (
                    <div className="flex items-center gap-3 p-3 bg-[#12161D] border border-[#1E2329] rounded-xl text-xs">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#5BE584]">
                        <User size={15} />
                      </div>
                      <div>
                        <span className="text-gray-400">Coach:</span>{" "}
                        <span className="font-semibold text-white">
                          Coach {appointment.trainer.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {appointment.member && isCoachView && (
                    <div className="flex items-center gap-3 p-3 bg-[#12161D] border border-[#1E2329] rounded-xl text-xs">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <User size={15} />
                      </div>
                      <div>
                        <span className="text-gray-400">Athlete:</span>{" "}
                        <span className="font-semibold text-white">
                          {appointment.member.name}
                        </span>
                        <span className="text-gray-500 ml-1">
                          ({appointment.member.email})
                        </span>
                      </div>
                    </div>
                  )}

                  {appointment.location && (
                    <div className="flex items-center gap-3 p-3 bg-[#12161D] border border-[#1E2329] rounded-xl text-xs">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <span className="text-gray-400">Location / Room:</span>{" "}
                        <span className="font-semibold text-white">
                          {appointment.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Member Notes */}
                {appointment.memberNotes && (
                  <div className="p-3.5 bg-[#12161D] border border-[#1E2329] rounded-xl text-sm">
                    <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-purple-400" />
                      Member Focus & Questions
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">
                      {appointment.memberNotes}
                    </p>
                  </div>
                )}

                {/* Private Coach Notes (Coach View Only - Strictly Protected) */}
                {isCoachView && appointment.coachNotes && (
                  <div className="p-3.5 bg-[#1A1824] border border-purple-500/30 rounded-xl text-sm">
                    <div className="text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
                      <Lock size={13} className="text-purple-400" />
                      Coach Confidential Notes (Private to You)
                    </div>
                    <p className="text-purple-200 text-xs leading-relaxed whitespace-pre-wrap">
                      {appointment.coachNotes}
                    </p>
                  </div>
                )}

                {/* Cancellation details */}
                {appointment.status === "CANCELLED" && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                    <div className="font-semibold mb-1 flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      Cancellation Reason
                    </div>
                    <p>{appointment.cancellationReason || "No reason provided."}</p>
                  </div>
                )}
              </>
            )}

            {/* Complete Form */}
            {actionTab === "complete" && (
              <form onSubmit={handleComplete} className="space-y-4">
                <div className="text-xs text-gray-400">
                  Mark this coaching session as completed and save your private assessment or review notes for future reference.
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Coach Session Notes & Observations
                  </label>
                  <textarea
                    rows={4}
                    value={completeNotes}
                    onChange={(e) => setCompleteNotes(e.target.value)}
                    placeholder="Enter key findings, recommendations, or progression milestones..."
                    className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionTab("detail")}
                    className="px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isCompleting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#4dd273] text-black disabled:opacity-50"
                  >
                    {isCompleting ? "Saving..." : "Confirm Completion"}
                  </button>
                </div>
              </form>
            )}

            {/* Cancel Form */}
            {actionTab === "cancel" && (
              <form onSubmit={handleCancel} className="space-y-4">
                <div className="text-xs text-gray-400">
                  Please provide a clear reason for cancellation. The other party will receive an automated notification.
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Cancellation Reason *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Rescheduling required due to client schedule conflict..."
                    className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionTab("detail")}
                    className="px-3.5 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isCancelling || !cancelReason.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Action Footer (Detail View) */}
          {actionTab === "detail" && (
            <div className="flex items-center justify-between p-5 bg-[#12161D] border-t border-[#1E2329]">
              {/* Left Action: Cancel / No-Show */}
              <div className="flex items-center gap-2">
                {(appointment.status === "SCHEDULED" ||
                  appointment.status === "RESCHEDULED") && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActionTab("cancel")}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Cancel
                    </button>
                    {isCoachView && (
                      <button
                        type="button"
                        onClick={handleMarkNoShow}
                        disabled={isMarkingNoShow}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                      >
                        {isMarkingNoShow ? "Marking..." : "No Show"}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Right Action: Mark Complete (for Coach) / Close */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Close
                </button>

                {isCoachView &&
                  (appointment.status === "SCHEDULED" ||
                    appointment.status === "RESCHEDULED") && (
                    <button
                      type="button"
                      onClick={() => setActionTab("complete")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02]"
                    >
                      <CheckCircle2 size={14} />
                      Complete Session
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
