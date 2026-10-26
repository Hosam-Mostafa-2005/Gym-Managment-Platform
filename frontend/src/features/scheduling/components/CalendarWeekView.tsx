// src/features/scheduling/components/CalendarWeekView.tsx
import { useMemo } from "react";
import {
  Calendar,
  Clock,
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Coffee,
  Plus,
  Play,
} from "lucide-react";
import type {
  ScheduledWorkout,
  CoachingAppointment,
} from "../types/scheduling.types";

interface CalendarWeekViewProps {
  currentDate: Date;
  scheduledWorkouts: ScheduledWorkout[];
  coachingAppointments: CoachingAppointment[];
  restDays?: string[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectAppointment: (appointment: CoachingAppointment) => void;
  onSelectDate?: (dateStr: string) => void;
  isCoachView?: boolean;
}

export default function CalendarWeekView({
  currentDate,
  scheduledWorkouts,
  coachingAppointments,
  restDays = [],
  onSelectWorkout,
  onSelectAppointment,
  onSelectDate,
  isCoachView = false,
}: CalendarWeekViewProps) {
  const restDaysSet = useMemo(() => new Set(restDays), [restDays]);

  // Compute 7 days of the week starting from Monday
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));

    const days: Array<{
      date: Date;
      dateKey: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const dateKey = current.toISOString().split("T")[0];
      days.push({
        date: current,
        dateKey,
        dayName: current.toLocaleDateString(undefined, { weekday: "short" }),
        dayNumber: current.getDate(),
        isToday: dateKey === todayStr,
      });
    }

    return days;
  }, [currentDate]);

  // Index events by dateKey
  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        workouts: ScheduledWorkout[];
        appointments: CoachingAppointment[];
      }
    >();

    for (const sw of scheduledWorkouts) {
      const key = new Date(sw.scheduledAt).toISOString().split("T")[0];
      if (!map.has(key)) map.set(key, { workouts: [], appointments: [] });
      map.get(key)!.workouts.push(sw);
    }

    for (const appt of coachingAppointments) {
      const key = new Date(appt.startTime).toISOString().split("T")[0];
      if (!map.has(key)) map.set(key, { workouts: [], appointments: [] });
      map.get(key)!.appointments.push(appt);
    }

    return map;
  }, [scheduledWorkouts, coachingAppointments]);

  const getWorkoutStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="text-[10px] font-semibold text-[#5BE584] flex items-center gap-1">
            <CheckCircle2 size={11} /> Completed
          </span>
        );
      case "MISSED":
        return (
          <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
            <AlertTriangle size={11} /> Missed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-semibold text-gray-500">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold text-blue-400 flex items-center gap-1">
            <Clock size={11} /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="bg-[#101418] border border-[#1E2329] rounded-2xl overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-[#1E2329]">
        {weekDays.map((day) => {
          const events = eventsByDate.get(day.dateKey) || {
            workouts: [],
            appointments: [],
          };
          const totalEvents = events.workouts.length + events.appointments.length;
          const isRest =
            !isCoachView && totalEvents === 0 && restDaysSet.has(day.dateKey);

          return (
            <div
              key={day.dateKey}
              className="flex flex-col min-h-[360px] bg-[#101418] hover:bg-[#13181E]/60 transition-colors"
            >
              {/* Day Header */}
              <div
                className={`p-3 text-center border-b border-[#1E2329] flex items-center justify-between md:flex-col md:gap-1 ${
                  day.isToday ? "bg-[#16291D]/40" : "bg-[#161B22]/30"
                }`}
              >
                <div className="flex items-center gap-2 md:flex-col md:gap-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {day.dayName}
                  </span>
                  <span
                    className={`text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center ${
                      day.isToday
                        ? "bg-[#5BE584] text-black font-extrabold shadow-md shadow-[#5BE584]/20"
                        : "text-white"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDate?.(day.dateKey)}
                  title="Schedule on this day"
                  className="h-6 w-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Day Body Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[500px]">
                {/* Coaching Appointments */}
                {events.appointments.map((appt) => {
                  const startTime = new Date(appt.startTime).toLocaleTimeString(
                    [],
                    { hour: "numeric", minute: "2-digit" },
                  );
                  const endTime = new Date(appt.endTime).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppointment(appt)}
                      className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between text-[10px] text-purple-300 font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={12} className="text-purple-400" />
                          Appointment
                        </span>
                        <span>{startTime}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {appt.title}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {isCoachView && appt.member
                          ? `With ${appt.member.name}`
                          : appt.trainer
                          ? `With Coach ${appt.trainer.name}`
                          : `${startTime} – ${endTime}`}
                      </div>
                    </div>
                  );
                })}

                {/* Scheduled Workouts */}
                {events.workouts.map((sw) => {
                  const timeStr = new Date(sw.scheduledAt).toLocaleTimeString(
                    [],
                    { hour: "numeric", minute: "2-digit" },
                  );
                  return (
                    <div
                      key={sw.id}
                      onClick={() => onSelectWorkout(sw)}
                      className="p-2.5 rounded-xl bg-[#161B22] hover:bg-[#1E2329] border border-[#262D35] text-left cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} className="text-[#5BE584]" />
                          {timeStr}
                        </span>
                        {getWorkoutStatusBadge(sw.status)}
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {sw.workout?.title || "Workout Session"}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span>
                          {sw.workout?.exercises?.length || 0} exercises
                        </span>
                        {sw.trainer && (
                          <span className="text-emerald-400">Coach</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Rest Day Announcement */}
                {isRest && (
                  <div className="p-3 rounded-xl bg-[#12161D]/70 border border-[#1E2329] text-center my-4">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-500/10 text-gray-400 mb-1">
                      <Coffee size={14} />
                    </div>
                    <div className="text-xs font-semibold text-gray-300">
                      Rest & Recovery
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      No workouts scheduled
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
