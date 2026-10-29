// src/features/scheduling/components/BookAppointmentDialog.tsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Clock,
  X,
  User,
  ShieldCheck,
  MapPin,
  MessageSquare,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useMembersManagement } from "@/features/members-management/hooks/use-members-management";
import { SearchableMemberSelect } from "@/features/users/components/SearchableMemberSelect";
import type { AppointmentType } from "../types/scheduling.types";
import { useCreateCoachAppointment } from "../hooks/useScheduling";

interface BookAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  preselectedMemberId?: string;
}

const APPOINTMENT_TYPES: Array<{
  value: AppointmentType;
  label: string;
  description: string;
}> = [
  {
    value: "CHECK_IN",
    label: "Routine Check-In",
    description: "Weekly consistency, recovery, and general progress discussion",
  },
  {
    value: "PROGRESS_REVIEW",
    label: "Progress & Metrics Review",
    description: "Review body measurements, lifts, and milestone charts",
  },
  {
    value: "CONSULTATION",
    label: "1-on-1 Consultation",
    description: "In-depth planning, training cycle design, or program adjustment",
  },
  {
    value: "ASSESSMENT",
    label: "Fitness Assessment",
    description: "Mobility screening, strength testing, or benchmark evaluations",
  },
  {
    value: "FORM_ANALYSIS",
    label: "Technique & Form Analysis",
    description: "Live barbell or movement form breakdown and correction",
  },
  {
    value: "GOAL_SETTING",
    label: "Goal Setting & Strategy",
    description: "Establish new 12-week targets and accountability milestones",
  },
  {
    value: "NUTRITION_SYNC",
    label: "Nutrition & Macro Sync",
    description: "Caloric targets, meal plans, and diet compliance review",
  },
];

export default function BookAppointmentDialog({
  isOpen,
  onClose,
  initialDate,
  preselectedMemberId,
}: BookAppointmentDialogProps) {
  const getDefaultDate = () => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [memberId, setMemberId] = useState(preselectedMemberId || "");
  const [title, setTitle] = useState("Weekly Check-In & Progress Review");
  const [type, setType] = useState<AppointmentType>("CHECK_IN");
  const [date, setDate] = useState(getDefaultDate());
  const [startTime, setStartTime] = useState("10:00");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [location, setLocation] = useState("Gym Coaching Suite");
  const [memberNotes, setMemberNotes] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: membersData, isLoading: isLoadingMembers } =
    useMembersManagement();
  const members = (membersData as any)?.members || [];

  const preselectedMember = preselectedMemberId
    ? members.find(
        (m: any) =>
          (m.member?.id || m.id) === preselectedMemberId,
      )
    : undefined;

  const { mutate: bookAppointment, isPending } = useCreateCoachAppointment();

  useEffect(() => {
    if (isOpen) {
      if (initialDate) setDate(initialDate);
      if (preselectedMemberId) setMemberId(preselectedMemberId);
      setError(null);
    }
  }, [isOpen, initialDate, preselectedMemberId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!memberId) {
      setError("Please select an athlete.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide an appointment title.");
      return;
    }

    if (!date || !startTime) {
      setError("Please specify both date and start time.");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    if (isNaN(startDateTime.getTime())) {
      setError("Invalid date or start time.");
      return;
    }

    const endDateTime = new Date(
      startDateTime.getTime() + durationMinutes * 60 * 1000,
    );

    bookAppointment(
      {
        memberId,
        title: title.trim(),
        type,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: location.trim() || undefined,
        memberNotes: memberNotes.trim() || undefined,
        coachNotes: coachNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setError(
            err?.response?.data?.message ||
              "Failed to book appointment. Please verify there are no time conflicts.",
          );
        },
      },
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Book Coaching Appointment
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  Schedule a 1-on-1 consultation, check-in, or review session
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Athlete Selector */}
            <SearchableMemberSelect
              value={memberId}
              onChange={setMemberId}
              members={members}
              preselectedMember={preselectedMember}
              disabled={isLoadingMembers}
              locked={Boolean(preselectedMemberId)}
              label="Select Athlete *"
              placeholder="Choose athlete..."
            />

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Appointment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Form Analysis & Squat Depth Review"
                className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Appointment Focus / Type *
              </label>
              <select
                required
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as AppointmentType;
                  setType(newType);
                  const matched = APPOINTMENT_TYPES.find((t) => t.value === newType);
                  if (matched) setTitle(matched.label);
                }}
                className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date, Time & Duration */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-purple-400" />
                Meeting Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gym Coaching Suite / Room B / Google Meet"
                className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Shared Member Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-purple-400" />
                Athlete Agendas & Instructions (Visible to Athlete)
              </label>
              <textarea
                rows={2}
                value={memberNotes}
                onChange={(e) => setMemberNotes(e.target.value)}
                placeholder="What should the athlete prepare or bring?"
                className="w-full bg-[#12161D] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Private Coach Notes (CONFIDENTIAL) */}
            <div className="p-3 bg-[#171520] border border-purple-500/20 rounded-xl">
              <label className="block text-xs font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-purple-400" />
                Private Coach Notes (Strictly Confidential — Hidden from Athlete)
              </label>
              <textarea
                rows={2}
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder="Private observation cues, prior injury notes, or testing goals..."
                className="w-full bg-[#0D1014] border border-[#1E2329] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Calendar size={14} className="fill-white" />
                {isPending ? "Booking..." : "Confirm & Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
