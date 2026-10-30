import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import {
  terminateActiveMemberRelationship,
  respondInvitation,
} from "../api/coaching-relationships.api";
import { useQueryClient } from "@tanstack/react-query";
import type { CoachingRelationship } from "../types/coaching-relationships.types";

interface ActiveCoachConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoachName?: string;
  incomingInvitation: CoachingRelationship | null;
  onSwitchedSuccessfully?: (newRelationship: CoachingRelationship) => void;
}

export const ActiveCoachConflictDialog: React.FC<
  ActiveCoachConflictDialogProps
> = ({
  isOpen,
  onClose,
  currentCoachName = "Current Coach",
  incomingInvitation,
  onSwitchedSuccessfully,
}) => {
  const { t } = useTranslation(["common"]);
  const queryClient = useQueryClient();
  const [isConfirmingStep, setIsConfirmingStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !incomingInvitation) return null;

  const incomingCoachName =
    incomingInvitation.trainer?.name || t("coachConflict.incomingCoachBadge", "New Coach");

  const handleEndAndSwitch = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Terminate current active relationship safely on backend
      await terminateActiveMemberRelationship();

      // Step 2: Accept the pending invitation from the new coach
      const updated = await respondInvitation(incomingInvitation.id, {
        action: "ACCEPT",
      });

      // Step 3: Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["coaching-relationships"] }),
        queryClient.invalidateQueries({ queryKey: ["member-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["my-assignments"] }),
      ]);

      toast.success(
        t("coachConflict.switchSuccess", {
          newCoach: incomingCoachName,
          defaultValue: `Successfully switched to Coach ${incomingCoachName}!`,
        }),
      );

      setIsConfirmingStep(false);
      onClose();

      if (onSwitchedSuccessfully) {
        onSwitchedSuccessfully(updated);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          t("coachConflict.failed", "Failed to update coaching relationship."),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#2A313A] bg-[#0E1217] shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2329] px-6 py-4 bg-[#12171E]">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t("coachConflict.title", "Active Coach Connection")}
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {t(
                  "coachConflict.subtitle",
                  "A member can only be linked to one active coach at a time.",
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#1E2329] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!isConfirmingStep ? (
            <>
              {/* Alert Callout */}
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed">
                {t("coachConflict.alreadyConnectedWithCoach", {
                  coachName: currentCoachName,
                  defaultValue: `You're already connected to ${currentCoachName}. End your current coaching relationship before accepting a new coach.`,
                })}
              </div>

              {/* Relationship Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Current Coach */}
                <div className="rounded-xl border border-[#1E2329] bg-[#141A22] p-4 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 mb-2">
                      <UserCheck className="h-3 w-3" />
                      {t("coachConflict.currentCoachBadge", "Active Coach")}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {currentCoachName}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mt-3">
                    {t(
                      "coachConflict.keepCurrent",
                      "Keep current coaching relationship",
                    )}
                  </p>
                </div>

                {/* Incoming Coach */}
                <div className="rounded-xl border border-[#5BE584]/30 bg-[#16291D]/30 p-4 flex flex-col justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-[#5BE584]/15 px-2 py-0.5 text-[10px] font-bold text-[#5BE584] border border-[#5BE584]/30 mb-2">
                      <UserPlus className="h-3 w-3" />
                      {t("coachConflict.incomingCoachBadge", "Pending Invitation")}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {incomingCoachName}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#5BE584]/80 mt-3">
                    {t("coachConflict.incomingCoachBadge", "New coaching request")}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Confirmation Step */
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="text-sm font-bold text-white">
                  {t("coachConflict.confirmEndTitle", "End Coaching Relationship?")}
                </h4>
              </div>
              <p className="text-xs text-red-200/90 leading-relaxed">
                {t("coachConflict.confirmEndPrompt", {
                  coachName: currentCoachName,
                  newCoach: incomingCoachName,
                  defaultValue: `Are you sure you want to end your coaching relationship with ${currentCoachName}? Once ended, your new coaching relationship with ${incomingCoachName} will become active.`,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-[#1E2329] px-6 py-4 bg-[#12171E]">
          <button
            type="button"
            onClick={() => {
              if (isConfirmingStep) {
                setIsConfirmingStep(false);
              } else {
                onClose();
              }
            }}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#1E2329] bg-[#141A22] text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors disabled:opacity-50"
          >
            {isConfirmingStep
              ? t("actions.cancel", "Cancel")
              : t("coachConflict.keepCurrent", "Keep Current Coach")}
          </button>

          {!isConfirmingStep ? (
            <button
              type="button"
              onClick={() => setIsConfirmingStep(true)}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#090B0F] text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              <span>
                {t("coachConflict.endCurrentAndAccept", {
                  newCoach: incomingCoachName,
                  defaultValue: `End Current & Accept ${incomingCoachName}`,
                })}
              </span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEndAndSwitch}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("coachConflict.cancelling", "Switching...")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {t(
                      "coachConflict.confirmAndSwitchButton",
                      "Confirm & Switch Coach",
                    )}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveCoachConflictDialog;
