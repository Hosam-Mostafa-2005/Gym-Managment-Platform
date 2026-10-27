import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { CheckCircle2, X, Trophy, Dumbbell, TrendingUp, AlertTriangle } from "lucide-react";
import { useFinishWorkoutSession } from "../hooks/useFinishWorkoutSession";
import { toast } from "sonner";

interface FinishWorkoutDialogProps {
  sessionId: string;
  stats?: {
    duration?: number;
    volume?: number;
    exercisesDone?: number;
    totalExercises?: number;
    setsDone?: number;
    totalSets?: number;
  };
}

export default function FinishWorkoutDialog({
  sessionId,
  stats,
}: FinishWorkoutDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [sessionRpe, setSessionRpe] = useState<number | null>(null);

  const { mutate: finishSession, isPending } = useFinishWorkoutSession();
  const navigate = useNavigate();

  const handleFinish = () => {
    finishSession(
      {
        id: sessionId,
        payload: {
          notes: notes.trim() || undefined,
          sessionRpe: sessionRpe ?? undefined,
        },
      },
      {
        onSuccess: (completedSession) => {
          setIsOpen(false);
          setNotes("");
          setSessionRpe(null);
          toast.success("Workout session finished! Great job!");
          navigate(`/sessions/${completedSession.id || sessionId}/summary`);
        },

        onError: (error) => {
          console.error("Failed to finish workout:", error);
          toast.error("Failed to finish workout.");
        },
      },
    );
  };

  const hasIncomplete =
    stats &&
    ((stats.exercisesDone !== undefined &&
      stats.totalExercises !== undefined &&
      stats.exercisesDone < stats.totalExercises) ||
      (stats.setsDone !== undefined &&
        stats.totalSets !== undefined &&
        stats.setsDone < stats.totalSets));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] shadow-[0_0_20px_rgba(91,229,132,0.2)] focus:outline-none focus:ring-2 focus:ring-[#5BE584]"
      >
        <Trophy className="h-4 w-4" />
        <span>Finish Workout</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-md">
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1E2329]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Complete Session
                      </h3>
                      <p className="text-xs text-[#9CA3AF]">
                        Save your performance logs & finalize telemetry.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Stats Grid Preview */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-[#1E2329] bg-[#101418]">
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                          Movements
                        </span>
                        <span className="text-base font-bold text-white font-mono mt-0.5">
                          {stats.exercisesDone ?? 0} / {stats.totalExercises ?? 0}
                        </span>
                      </div>
                      <div className="flex flex-col text-center border-x border-[#1E2329]">
                        <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                          Sets Done
                        </span>
                        <span className="text-base font-bold text-white font-mono mt-0.5">
                          {stats.setsDone ?? 0} / {stats.totalSets ?? 0}
                        </span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                          Total Volume
                        </span>
                        <span className="text-base font-bold text-[#5BE584] font-mono mt-0.5">
                          {stats.volume?.toLocaleString() ?? 0} kg
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Advisory Notice if incomplete */}
                  {hasIncomplete ? (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400" />
                      <p className="text-xs leading-relaxed">
                        Some sets or movements haven't been marked completed yet. You can still finish now, and completed sets will be recorded.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3.5 bg-[#16291D]/80 rounded-xl border border-[#23422E] text-emerald-300">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#5BE584]" />
                      <p className="text-xs leading-relaxed">
                        Incredible work! All scheduled movements and target sets have been logged.
                      </p>
                    </div>
                  )}

                  {/* Session RPE / Intensity Rating */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                        Session Exertion (RPE 1–10)
                      </label>
                      <span className="text-xs font-mono font-medium text-[#5BE584]">
                        {sessionRpe ? `RPE ${sessionRpe} / 10` : "Optional"}
                      </span>
                    </div>

                    <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const isSelected = sessionRpe === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setSessionRpe(isSelected ? null : score)}
                            className={`h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-[#5BE584] text-[#090B0F] ring-2 ring-[#5BE584]/50 shadow-[0_0_12px_rgba(91,229,132,0.3)]"
                                : "bg-[#101418] border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A]"
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-[#6B7280] px-0.5">
                      <span>1: Very Light</span>
                      <span>5: Moderate</span>
                      <span>10: Max Effort</span>
                    </div>
                  </div>

                  {/* Reflection Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                      Workout Reflection & Notes
                    </label>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How did your energy, weights, and pacing feel today? (Optional)"
                      rows={3}
                      className="w-full bg-[#101418] border border-[#1E2329] rounded-xl p-3.5 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#5BE584] resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1E2329] bg-[#101418]/50">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 text-xs font-medium rounded-xl border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors disabled:opacity-50"
                  >
                    Continue Training
                  </button>

                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] disabled:opacity-50"
                  >
                    {isPending && (
                      <span className="w-3.5 h-3.5 border-2 border-[#090B0F] border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{isPending ? "Finalizing..." : "Complete & Save Session"}</span>
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
