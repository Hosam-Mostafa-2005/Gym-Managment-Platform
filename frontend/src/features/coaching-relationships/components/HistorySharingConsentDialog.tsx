import React, { useState } from "react";
import { ShieldCheck, Lock, CheckCircle2, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useUpdateHistoryConsent } from "../hooks/useUpdateHistoryConsent";
import type { HistorySharingConsent } from "../types/coaching-relationships.types";

interface HistorySharingConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relationshipId: string;
  coachName?: string;
  initialConsent?: HistorySharingConsent;
  onConsentUpdated?: (consent: HistorySharingConsent) => void;
}

export const HistorySharingConsentDialog: React.FC<
  HistorySharingConsentDialogProps
> = ({
  isOpen,
  onClose,
  relationshipId,
  coachName = "your Coach",
  initialConsent = "PENDING",
  onConsentUpdated,
}) => {
  const [selectedConsent, setSelectedConsent] = useState<"GRANTED" | "DECLINED">(
    initialConsent === "GRANTED" ? "GRANTED" : "DECLINED",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: updateConsent, isPending } = useUpdateHistoryConsent();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    updateConsent(
      {
        id: relationshipId,
        payload: {
          consent: selectedConsent,
        },
      },
      {
        onSuccess: (data) => {
          if (onConsentUpdated) {
            onConsentUpdated(data.historySharingConsent);
          }
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(
            err.response?.data?.message ||
              err.message ||
              "Failed to update history sharing consent.",
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[#1E2329] bg-[#0D1014] p-6 shadow-2xl relative text-[#F3F4F6]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2329]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#23422e] bg-[#16291d] text-[#5BE584]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Workout & Measurement History Privacy
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Choose how your pre-coaching data is shared with {coachName}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#1E2329] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <p className="text-xs text-gray-300 leading-relaxed">
            Coaching works best when your coach understands your training baseline. You can share your past workout sessions and body measurements, or keep your history private:
          </p>

          <div className="space-y-3">
            {/* Option 1: Share History */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                selectedConsent === "GRANTED"
                  ? "border-[#5BE584] bg-[#16291d]/30"
                  : "border-[#1E2329] bg-[#101418] hover:border-[#2A313A]"
              }`}
            >
              <input
                type="radio"
                name="historyConsent"
                value="GRANTED"
                checked={selectedConsent === "GRANTED"}
                onChange={() => setSelectedConsent("GRANTED")}
                className="mt-1 accent-[#5BE584]"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Share My History
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-[#5BE584]/15 px-2 py-0.5 text-[10px] font-bold text-[#5BE584] border border-[#5BE584]/30">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Allow {coachName} to view past workout sessions, volume trends, and body measurements. Past records will be clearly marked as historical and distinct from new coaching progress.
                </p>
              </div>
            </label>

            {/* Option 2: Keep History Private */}
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                selectedConsent === "DECLINED"
                  ? "border-[#5BE584] bg-[#16291d]/30"
                  : "border-[#1E2329] bg-[#101418] hover:border-[#2A313A]"
              }`}
            >
              <input
                type="radio"
                name="historyConsent"
                value="DECLINED"
                checked={selectedConsent === "DECLINED"}
                onChange={() => setSelectedConsent("DECLINED")}
                className="mt-1 accent-[#5BE584]"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Keep My History Private
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-gray-400 border border-zinc-700">
                    <Lock className="h-3 w-3" />
                    Private
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Keep all workouts and body measurements logged prior to today private. {coachName} will only see workouts and measurements recorded while being actively coached.
                </p>
              </div>
            </label>
          </div>

          <div className="rounded-lg border border-[#1E2329] bg-[#101418] p-3 text-[11px] text-gray-500">
            You can modify or revoke this consent at any time from your Member Profile settings.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2329]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#1E2329] hover:text-white"
            >
              Decide Later
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-bold text-[#090B0F] transition-all hover:bg-[#4ade80] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Preference...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Choice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
