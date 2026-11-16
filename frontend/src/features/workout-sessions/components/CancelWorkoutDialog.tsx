import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { XOctagon, X, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCancelWorkoutSession } from "../hooks/useCancelWorkoutSession";

interface CancelWorkoutDialogProps {
  sessionId: string;
}

export default function CancelWorkoutDialog({ sessionId }: CancelWorkoutDialogProps) {
  const { t } = useTranslation(["workoutSessions", "common"]);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  const { mutate: cancelSession, isPending } = useCancelWorkoutSession();

  const handleConfirmCancel = () => {
    cancelSession(
      {
        id: sessionId,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          navigate("/sessions");
        },
      },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:border-red-800/60 transition-colors"
        title={t("activeWorkout.cancelWorkout", "Cancel Workout")}
      >
        <XOctagon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("activeWorkout.cancelWorkout", "Cancel")}</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-md">
            <div className="min-h-full flex items-center justify-center p-4">
              <div
                className="fixed inset-0"
                onClick={() => !isPending && setIsOpen(false)}
              />

              <div className="relative w-full max-w-md rounded-2xl border border-red-900/40 bg-[#101418] p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1E2329] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950/50 text-red-400 border border-red-900/40">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {t("activeWorkout.cancelModalTitle", "Cancel Workout?")}
                      </h3>
                      <p className="text-xs text-[#9CA3AF]">
                        {t("activeWorkout.cancelModalSubtitle", "This session will be marked as cancelled.")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isPending && setIsOpen(false)}
                    disabled={isPending}
                    className="rounded-lg p-1 text-[#6B7280] hover:text-white hover:bg-[#1A1F26] transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="py-5 space-y-4">
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {t(
                      "activeWorkout.cancelWarning",
                      "Are you sure you want to abandon this session? Any completed sets will be recorded, but the session will be terminated and marked as cancelled.",
                    )}
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D1D5DB]">
                      {t("activeWorkout.cancelReasonLabel", "Reason for cancelling (optional)")}
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("activeWorkout.cancelReasonPlaceholder", "e.g. Ran out of time, feeling unwell...")}
                      maxLength={120}
                      className="w-full rounded-xl border border-[#1E2329] bg-[#090B0E] px-3.5 py-2.5 text-xs text-white placeholder-[#6B7280] focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2329]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="rounded-xl border border-[#1E2329] px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors disabled:opacity-50"
                  >
                    {t("common.back", "Continue Workout")}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>{t("common.cancelling", "Cancelling...")}</span>
                      </>
                    ) : (
                      <>
                        <XOctagon className="h-3.5 w-3.5" />
                        <span>{t("activeWorkout.confirmCancel", "Abandon Session")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
