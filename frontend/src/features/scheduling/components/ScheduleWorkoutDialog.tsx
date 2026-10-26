// src/features/scheduling/components/ScheduleWorkoutDialog.tsx
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Clock,
  X,
  Dumbbell,
  User,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useMembersManagement } from "@/features/members-management/hooks/use-members-management";
import { useMemberProfile } from "@/features/member-profile/hooks/use-member-profile";
import {
  useCreateScheduledWorkout,
  useCreateCoachScheduledWorkout,
} from "../hooks/useScheduling";
import { SearchableMemberSelect } from "@/features/users/components/SearchableMemberSelect";

interface ScheduleWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  isCoach?: boolean;
  preselectedMemberId?: string;
  preselectedWorkoutId?: string;
}

export default function ScheduleWorkoutDialog({
  isOpen,
  onClose,
  initialDate,
  isCoach = false,
  preselectedMemberId,
  preselectedWorkoutId,
}: ScheduleWorkoutDialogProps) {
  const getDefaultDate = () => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState("09:00");
  const [workoutId, setWorkoutId] = useState(preselectedWorkoutId || "");
  const [memberId, setMemberId] = useState(preselectedMemberId || "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useWorkouts();
  const { data: membersData, isLoading: isLoadingMembers } =
    useMembersManagement();

  const workouts = Array.isArray(workoutsData)
    ? workoutsData
    : (workoutsData as any)?.workouts || [];

  const rawMembers = (membersData as any)?.members || [];
  const members = useMemo(
    () => rawMembers.map((m: any) => m.member || m),
    [rawMembers],
  );

  const { data: memberProfile } = useMemberProfile(
    preselectedMemberId || undefined,
  );
  const preselectedMember = memberProfile?.member;

  // Reset or initialize when props change
  useEffect(() => {
    if (isOpen) {
      if (initialDate) setDate(initialDate);
      if (preselectedWorkoutId) setWorkoutId(preselectedWorkoutId);
      if (preselectedMemberId) setMemberId(preselectedMemberId);
      setError(null);
    }
  }, [isOpen, initialDate, preselectedWorkoutId, preselectedMemberId]);

  const { mutate: scheduleSelf, isPending: isSchedulingSelf } =
    useCreateScheduledWorkout();
  const { mutate: scheduleCoach, isPending: isSchedulingCoach } =
    useCreateCoachScheduledWorkout();

  const isPending = isSchedulingSelf || isSchedulingCoach;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workoutId) {
      setError("Please choose a workout to schedule.");
      return;
    }

    if (isCoach && !memberId) {
      setError("Please select an athlete to assign this scheduled workout.");
      return;
    }

    if (!date || !time) {
      setError("Please select both a date and a time.");
      return;
    }

    const scheduledDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledDateTime.getTime())) {
      setError("Invalid date or time selected.");
      return;
    }

    if (isCoach) {
      scheduleCoach(
        {
          memberId,
          workoutId,
          scheduledAt: scheduledDateTime.toISOString(),
          notes: notes.trim() || undefined,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      scheduleSelf(
        {
          workoutId,
          scheduledAt: scheduledDateTime.toISOString(),
          notes: notes.trim() || undefined,
        },
        {
          onSuccess: () => {
            onClose();
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isCoach ? "Schedule Workout for Athlete" : "Schedule Workout"}
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  {isCoach
                    ? "Add a workout session to athlete's training calendar"
                    : "Plan your workout session in advance"}
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
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Athlete Selector (Coach Only) */}
            {isCoach && (
              <SearchableMemberSelect
                value={memberId}
                onChange={setMemberId}
                members={members}
                preselectedMember={preselectedMember}
                disabled={isLoadingMembers}
                locked={Boolean(preselectedMemberId)}
                label="Select Athlete *"
                placeholder="Choose an athlete..."
              />
            )}

            {/* Workout Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Dumbbell size={13} className="text-[#5BE584]" />
                Select Workout *
              </label>
              <select
                required
                value={workoutId}
                onChange={(e) => setWorkoutId(e.target.value)}
                className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#5BE584]"
                disabled={isLoadingWorkouts}
              >
                <option value="">Choose a workout plan...</option>
                {workouts.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.difficulty?.toLowerCase() || "standard"})
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#5BE584]" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} className="text-[#5BE584]" />
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584]"
                />
              </div>
            </div>

            {/* Notes / Instructions */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <FileText size={13} className="text-[#5BE584]" />
                Instructions or Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isCoach
                    ? "Add tempo instructions, target RPE, or focus cues..."
                    : "Notes for this workout session..."
                }
                className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#5BE584]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#4dd273] text-black shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Calendar size={14} className="fill-black" />
                {isPending ? "Scheduling..." : "Schedule Workout"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
