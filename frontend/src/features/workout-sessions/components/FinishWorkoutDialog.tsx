import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import { useFinishWorkoutSession } from "../hooks/useFinishWorkoutSession";

interface FinishWorkoutDialogProps {
  sessionId: string;
}

export default function FinishWorkoutDialog({
  sessionId,
}: FinishWorkoutDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const { mutate: finishSession, isPending } = useFinishWorkoutSession();
  const navigate = useNavigate();

  const handleFinish = () => {
    finishSession(
      { id: sessionId, payload: { notes } },
      {
        onSuccess: () => {
          setIsOpen(false);
          navigate(`/workouts/${sessionId}`);
        },
      },
    );
  };

  return (
    <>
      <div className="mt-8 flex justify-center md:justify-end">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#5BE584] hover:opacity-90 text-black px-8 py-3.5 rounded-xl font-semibold transition-opacity w-full md:w-auto text-lg md:text-base"
        >
          Finish Workout
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#11151B] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Complete Session</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6 p-4 bg-[#5BE584]/10 rounded-xl border border-[#5BE584]/20 text-[#5BE584]">
                <CheckCircle2 size={24} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  Great job! Are you ready to complete this workout? Make sure
                  you have logged all your sets.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-[#9CA3AF]">
                  Session Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did this workout feel?"
                  className="w-full bg-[#090B0F] border border-white/10 rounded-xl p-4 text-white placeholder:text-[#9CA3AF]/50 focus:outline-none focus:border-[#5BE584] resize-none h-28 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5 bg-black/20">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl font-medium bg-[#5BE584] text-black hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPending && (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                )}
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
