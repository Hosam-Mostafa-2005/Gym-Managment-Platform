// src/features/scheduling/components/RescheduleWorkoutDialog.tsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, X, Dumbbell, User, FileText, Loader2, RotateCcw } from "lucide-react";
import type { ScheduledWorkout } from "../types/scheduling.types";
import {
  useUpdateScheduledWorkout,
  useUpdateCoachScheduledWorkout,
} from "../hooks/useScheduling";

interface RescheduleWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledWorkout: ScheduledWorkout | null;
  isCoach?: boolean;
}

export default function RescheduleWorkoutDialog({
  isOpen,
  onClose,
  scheduledWorkout,
  isCoach = false,
}: RescheduleWorkoutDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: updateMemberScheduled, isPending: isUpdatingMember } =
    useUpdateScheduledWorkout();
  const { mutate: updateCoachScheduled, isPending: isUpdatingCoach } =
    useUpdateCoachScheduledWorkout();

  const isPending = isUpdatingMember || isUpdatingCoach;

  useEffect(() => {
    if (scheduledWorkout && isOpen) {
      try {
        const d = new Date(scheduledWorkout.scheduledAt);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          setDate(`${year}-${month}-${day}`);

          const hours = String(d.getHours()).padStart(2, "0");
          const mins = String(d.getMinutes()).padStart(2, "0");
          setTime(`${hours}:${mins}`);
        }
      } catch {
        // Fallback to today
        setDate(new Date().toISOString().split("T")[0]);
        setTime("09:00");
      }
      setNotes(scheduledWorkout.notes || "");
      setError(null);
    }
  }, [scheduledWorkout, isOpen]);

  if (!isOpen || !scheduledWorkout) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !time) {
      setError("Please select both a date and a time.");
      return;
    }

    const scheduledDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDateTime.getTime())) {
      setError("Invalid date or time value.");
      return;
    }

    if (scheduledDateTime.getTime() <= Date.now()) {
      setError("Please select a date and time in the future.");
      return;
    }

    const payload = {
      scheduledAt: scheduledDateTime.toISOString(),
      notes: notes.trim() || undefined,
    };

    if (isCoach) {
      updateCoachScheduled(
        { id: scheduledWorkout.id, payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: any) => {
            setError(
              err?.response?.data?.message ||
                "Failed to reschedule workout. Please try again.",
            );
          },
        },
      );
    } else {
      updateMemberScheduled(
        { id: scheduledWorkout.id, payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: any) => {
            setError(
              err?.response?.data?.message ||
                "Failed to reschedule workout. Please try again.",
            );
          },
        },
      );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Reschedule Workout
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update scheduled date & time
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isPending}
              className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            {/* Target Workout Details */}
            <div className="p-3.5 bg-[#12161D] border border-[#1E2329] rounded-xl flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584] flex-shrink-0">
                <Dumbbell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {scheduledWorkout.workout?.title || "Workout Session"}
                </div>
                {scheduledWorkout.member?.name && isCoach && (
                  <div className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                    <User size={11} className="text-[#5BE584]" />
                    Athlete: {scheduledWorkout.member.name}
                  </div>
                )}
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-[#5BE584]" />
                New Scheduled Date
              </label>
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#161B22] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5BE584] transition-colors"
              />
            </div>

            {/* Time Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <Clock size={13} className="text-[#5BE584]" />
                New Scheduled Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#161B22] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5BE584] transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                <FileText size={13} className="text-[#5BE584]" />
                Notes / Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Moved from morning due to travel..."
                rows={2}
                maxLength={500}
                className="w-full bg-[#161B22] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#5BE584] transition-colors resize-none"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2329]">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#49d472] text-[#090B0F] shadow-lg shadow-[#5BE584]/20 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <RotateCcw size={13} />
                    Confirm Reschedule
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
