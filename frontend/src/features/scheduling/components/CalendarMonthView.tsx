// src/features/scheduling/components/CalendarMonthView.tsx
import { useMemo } from "react";
import {
  Dumbbell,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Coffee,
} from "lucide-react";
import type {
  ScheduledWorkout,
  CoachingAppointment,
} from "../types/scheduling.types";

interface CalendarMonthViewProps {
  currentDate: Date;
  scheduledWorkouts: ScheduledWorkout[];
  coachingAppointments: CoachingAppointment[];
  restDays?: string[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectAppointment: (appointment: CoachingAppointment) => void;
  onSelectDate?: (dateStr: string) => void;
  isCoachView?: boolean;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonthView({
  currentDate,
  scheduledWorkouts,
  coachingAppointments,
  restDays = [],
  onSelectWorkout,
  onSelectAppointment,
  onSelectDate,
  isCoachView = false,
}: CalendarMonthViewProps) {
  const restDaysSet = useMemo(() => new Set(restDays), [restDays]);

  // Compute month cells
  const monthCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0 = Sun
    const totalDaysInMonth = lastDay.getDate();

    const cells: Array<{
      date: Date;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = d.toISOString().split("T")[0];
      cells.push({
        date: d,
        dateKey,
        isCurrentMonth: false,
        isToday: dateKey === todayStr,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateKey = d.toISOString().split("T")[0];
      cells.push({
        date: d,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayStr,
      });
    }

    // Next month padding to fill complete grid rows (multiple of 7)
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const dateKey = d.toISOString().split("T")[0];
        cells.push({
          date: d,
          dateKey,
          isCurrentMonth: false,
          isToday: dateKey === todayStr,
        });
      }
    }

    return cells;
  }, [currentDate]);

  // Index events by dateKey (YYYY-MM-DD)
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#5BE584]";
      case "MISSED":
        return "bg-amber-400";
      case "CANCELLED":
        return "bg-gray-500";
      case "RESCHEDULED":
        return "bg-purple-400";
      default:
        return "bg-blue-400";
    }
  };

  return (
    <div className="bg-[#101418] border border-[#1E2329] rounded-2xl overflow-hidden shadow-xl">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#1E2329] bg-[#161B22]/50 text-center text-xs font-semibold text-gray-400">
        {WEEKDAY_NAMES.map((day) => (
          <div key={day} className="py-3 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#1E2329]/60">
        {monthCells.map((cell) => {
          const events = eventsByDate.get(cell.dateKey) || {
            workouts: [],
            appointments: [],
          };
          const totalEvents = events.workouts.length + events.appointments.length;
          const isRest =
            !isCoachView &&
            totalEvents === 0 &&
            cell.isCurrentMonth &&
            restDaysSet.has(cell.dateKey);

          return (
            <div
              key={cell.dateKey}
              onClick={() => onSelectDate?.(cell.dateKey)}
              className={`min-h-[110px] md:min-h-[125px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-[#161B22]/40 ${
                !cell.isCurrentMonth ? "opacity-35 bg-[#0A0D11]/30" : "bg-[#101418]"
              }`}
            >
              {/* Day Number Row */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold flex items-center justify-center h-6 w-6 rounded-full transition-all ${
                    cell.isToday
                      ? "bg-[#5BE584] text-black font-extrabold shadow-md shadow-[#5BE584]/20"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {cell.date.getDate()}
                </span>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="h-5 w-5 rounded-md bg-white/5 flex items-center justify-center text-gray-400 hover:text-white">
                    <Plus size={12} />
                  </span>
                </div>
              </div>

              {/* Day Events Stack */}
              <div className="flex-1 space-y-1 overflow-hidden">
                {/* Coaching Appointments */}
                {events.appointments.slice(0, 2).map((appt) => {
                  const startTimeStr = new Date(appt.startTime).toLocaleTimeString(
                    [],
                    { hour: "numeric", minute: "2-digit" },
                  );
                  return (
                    <button
                      key={appt.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(appt);
                      }}
                      className="w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[11px] font-semibold text-purple-300 truncate transition-colors"
                    >
                      <ShieldCheck size={11} className="shrink-0 text-purple-400" />
                      <span className="truncate">
                        {startTimeStr} {appt.title}
                      </span>
                    </button>
                  );
                })}

                {/* Scheduled Workouts */}
                {events.workouts.slice(0, 2).map((sw) => {
                  const timeStr = new Date(sw.scheduledAt).toLocaleTimeString(
                    [],
                    { hour: "numeric", minute: "2-digit" },
                  );
                  return (
                    <button
                      key={sw.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWorkout(sw);
                      }}
                      className="w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#161B22] hover:bg-[#1E2329] border border-[#262D35] text-[11px] font-medium text-gray-200 truncate transition-colors"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${getStatusDot(
                          sw.status,
                        )}`}
                      />
                      <span className="truncate">
                        {timeStr} {sw.workout?.title || "Workout"}
                      </span>
                    </button>
                  );
                })}

                {/* More indicator */}
                {totalEvents > 2 && (
                  <div className="text-[10px] font-semibold text-gray-400 pl-1">
                    +{totalEvents - 2} more
                  </div>
                )}

                {/* Rest Day Indicator */}
                {isRest && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500/80 pt-1">
                    <Coffee size={11} className="text-gray-500" />
                    <span>Rest Day</span>
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
