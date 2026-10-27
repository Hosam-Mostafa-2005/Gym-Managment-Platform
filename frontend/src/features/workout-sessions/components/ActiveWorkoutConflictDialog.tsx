import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  Play,
  RotateCcw,
  Calendar,
  X,
  Trash2,
} from "lucide-react";
import { useCancelWorkoutSession } from "../hooks/useCancelWorkoutSession";
import { useStartWorkoutSession } from "../hooks/useStartWorkoutSession";
import ScheduleWorkoutDialog from "./ScheduleWorkoutDialog";

interface ActiveWorkoutConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string;
  activeWorkoutTitle: string;
  requestedWorkoutId?: string;
  requestedWorkoutTitle?: string;
  requestedAssignmentId?: string;
}

export default function ActiveWorkoutConflictDialog({
  isOpen,
  onClose,
  activeSessionId,
  activeWorkoutTitle,
  requestedWorkoutId,
  requestedWorkoutTitle,
  requestedAssignmentId,
}: ActiveWorkoutConflictDialogProps) {
  const navigate = useNavigate();
  const [isAbandonConfirming, setIsAbandonConfirming] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const { mutate: cancelActiveSession, isPending: isCancelling } =
    useCancelWorkoutSession();
  const { mutate: startNewSession, isPending: isStarting } =
    useStartWorkoutSession();

  if (!isOpen) return null;

  const handleResume = () => {
    onClose();
    toast.success("Resuming your active workout session.");
    navigate("/sessions/active");
  };

  const handleAbandonAndStartNew = () => {
    cancelActiveSession(
      {
        id: activeSessionId,
        reason: `Replaced by ${requestedWorkoutTitle || "new workout"}`,
      },
      {
        onSuccess: () => {
          if (requestedAssignmentId) {
            startNewSession(
              { assignment: requestedAssignmentId },
              {
                onSuccess: () => {
                  onClose();
                  navigate("/sessions/active");
                },
              },
            );
          } else if (requestedWorkoutId) {
            startNewSession(
              { workout: requestedWorkoutId },
              {
                onSuccess: () => {
                  onClose();
                  navigate("/sessions/active");
                },
              },
            );
          }
        },
      },
    );
  };

  const handleOpenSchedule = () => {
    onClose();
    setIsScheduleOpen(true);
  };

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-[#0D1014] border border-amber-500/30 rounded-2xl w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#1E2329] bg-amber-500/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Active Workout in Progress
                    </h3>
                    <p className="text-xs text-[#9CA3AF]">
                      Another session is currently running
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    Currently In Progress
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {activeWorkoutTitle || "Workout Session"}
                  </h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    You already have an active session running. To ensure accurate telemetry and prevent data loss, STREN keeps your session progress intact until you choose an action.
                  </p>
                </div>

                {isAbandonConfirming ? (
                  <div className="p-4 rounded-xl border border-red-900/50 bg-red-950/20 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-300">
                      <Trash2 size={15} className="text-red-400" />
                      <span>Are you sure you want to abandon the active session?</span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                      Your current session will be marked cancelled and telemetry will stop. The new workout will begin immediately.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAbandonConfirming(false)}
                        disabled={isCancelling || isStarting}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1E2329] text-[#9CA3AF] hover:text-white transition-colors"
                      >
                        Keep Active
                      </button>
                      <button
                        type="button"
                        onClick={handleAbandonAndStartNew}
                        disabled={isCancelling || isStarting}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-50"
                      >
                        {isCancelling || isStarting ? "Switching..." : "Confirm Abandon & Start"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Action 1: Resume */}
                    <button
                      type="button"
                      onClick={handleResume}
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 gap-2 sm:gap-3 rounded-xl bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] font-semibold text-xs transition-all shadow-[0_0_15px_rgba(91,229,132,0.15)] group"
                    >
                      <div className="flex items-center gap-3">
                        <Play size={16} className="fill-current" />
                        <div className="text-left">
                          <p className="font-bold">Resume Active Session</p>
                          <p className="text-[11px] opacity-80 font-normal">
                            Jump back into "{activeWorkoutTitle}"
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] bg-black/15 px-2 py-1 rounded-md font-mono">
                        Recommended
                      </span>
                    </button>

                    {/* Action 2: Schedule Requested Workout */}
                    {requestedWorkoutId && (
                      <button
                        type="button"
                        onClick={handleOpenSchedule}
                        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 gap-2 sm:gap-3 rounded-xl border border-[#1E2329] bg-[#101418] hover:border-[#2A313A] hover:bg-[#161B22] text-white text-xs font-medium transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-[#5BE584]" />
                          <div className="text-left">
                            <p className="font-semibold text-white">
                              Schedule "{requestedWorkoutTitle || "New Workout"}" for Later
                            </p>
                            <p className="text-[11px] text-[#9CA3AF]">
                              Keep active session running and book this for another time
                            </p>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Action 3: Abandon and Start New */}
                    <button
                      type="button"
                      onClick={() => setIsAbandonConfirming(true)}
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 gap-2 sm:gap-3 rounded-xl border border-[#1E2329] bg-[#101418] hover:border-red-900/50 hover:bg-red-950/10 text-red-300 text-xs font-medium transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <RotateCcw size={16} className="text-red-400" />
                        <div className="text-left">
                          <p className="font-semibold text-red-300">
                            Abandon Active Session & Start New
                          </p>
                          <p className="text-[11px] text-[#9CA3AF]">
                            End current workout and begin the requested workout immediately
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end p-4 border-t border-[#1E2329] bg-[#101418]/40">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
                >
                  Close & Stay on Page
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Embedded Schedule Dialog if member chose Schedule */}
      {isScheduleOpen && requestedWorkoutId && (
        <ScheduleWorkoutDialog
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          workoutId={requestedWorkoutId}
          workoutTitle={requestedWorkoutTitle || "Workout"}
          assignmentId={requestedAssignmentId}
        />
      )}
    </>
  );
}
