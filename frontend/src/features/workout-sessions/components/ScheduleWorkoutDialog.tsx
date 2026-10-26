import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, X, Dumbbell, AlertCircle } from "lucide-react";
import { useCreateScheduledWorkout } from "../hooks/useCreateScheduledWorkout";

interface ScheduleWorkoutDialogProps {
  workoutId: string;
  workoutTitle: string;
  assignmentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScheduleWorkoutDialog({
  workoutId,
  workoutTitle,
  assignmentId,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleWorkoutDialogProps) {
  // Default date to tomorrow at 09:00
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: scheduleWorkout, isPending } = useCreateScheduledWorkout();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !time) {
      setError("Please select both a date and a time.");
      return;
    }

    const scheduledDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDateTime.getTime())) {
      setError("Invalid date or time selected.");
      return;
    }

    if (scheduledDateTime.getTime() <= Date.now()) {
      setError("Scheduled workout must be set for a future date and time.");
      return;
    }

    scheduleWorkout(
      {
        workoutId,
        assignmentId,
        scheduledAt: scheduledDateTime.toISOString(),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      },
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Schedule Workout
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Plan your training session for a future time
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Workout Info Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#1E2329] bg-[#101418]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
                <Dumbbell size={16} />
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[#6B7280]">
                  Target Routine
                </span>
                <p className="text-sm font-semibold text-white truncate">
                  {workoutTitle}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
                  <Calendar size={13} /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#101418] border border-[#1E2329] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584] transition-colors"
                  required
                />
              </div>

              {/* Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
                  <Clock size={13} /> Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#101418] border border-[#1E2329] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9CA3AF]">
                Scheduling Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Target weights, personal objectives, or pre-workout reminders..."
                rows={3}
                className="w-full bg-[#101418] border border-[#1E2329] rounded-xl p-3 text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#5BE584] resize-none transition-colors"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2329]">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-[#1E2329] text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] disabled:opacity-50"
              >
                {isPending && (
                  <span className="w-3 h-3 border-2 border-[#090B0F] border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isPending ? "Scheduling..." : "Confirm Schedule"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
