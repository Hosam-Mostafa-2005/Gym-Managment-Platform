// src/features/scheduling/components/CalendarAgendaView.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  User,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatLocalDateKey } from "@/utils/formatDate";
import type {
  ScheduledWorkout,
  CoachingAppointment,
} from "../types/scheduling.types";
import { useStartScheduledWorkout } from "../hooks/useScheduling";

interface CalendarAgendaViewProps {
  scheduledWorkouts: ScheduledWorkout[];
  coachingAppointments: CoachingAppointment[];
  onSelectWorkout: (workout: ScheduledWorkout) => void;
  onSelectAppointment: (appointment: CoachingAppointment) => void;
  isCoachView?: boolean;
}

type AgendaEvent =
  | { kind: "workout"; data: ScheduledWorkout; sortTime: number }
  | { kind: "appointment"; data: CoachingAppointment; sortTime: number };

export default function CalendarAgendaView({
  scheduledWorkouts,
  coachingAppointments,
  onSelectWorkout,
  onSelectAppointment,
  isCoachView = false,
}: CalendarAgendaViewProps) {
  const { t, i18n } = useTranslation("trainingCalendar");
  const navigate = useNavigate();
  const { mutate: startWorkout, isPending: isStarting } =
    useStartScheduledWorkout();

  // Combine and sort events
  const groupedEvents = useMemo(() => {
    const list: AgendaEvent[] = [];

    for (const sw of scheduledWorkouts) {
      list.push({
        kind: "workout",
        data: sw,
        sortTime: new Date(sw.scheduledAt).getTime(),
      });
    }

    for (const appt of coachingAppointments) {
      list.push({
        kind: "appointment",
        data: appt,
        sortTime: new Date(appt.startTime).getTime(),
      });
    }

    list.sort((a, b) => a.sortTime - b.sortTime);

    // Group into Date keys
    const groups: Array<{
      dateKey: string;
      label: string;
      events: AgendaEvent[];
    }> = [];

    const groupMap = new Map<string, AgendaEvent[]>();
    const todayStr = formatLocalDateKey(new Date());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatLocalDateKey(tomorrow);

    for (const item of list) {
      const dateKey = formatLocalDateKey(item.sortTime);
      if (!groupMap.has(dateKey)) groupMap.set(dateKey, []);
      groupMap.get(dateKey)!.push(item);
    }

    for (const [dateKey, events] of groupMap.entries()) {
      const formattedDate = new Date(dateKey + "T00:00:00").toLocaleDateString(
        i18n.language === "ar" ? "ar-EG" : "en-US",
        {
          weekday: "long",
          month: "short",
          day: "numeric",
        },
      );

      let label = formattedDate;
      if (dateKey === todayStr) {
        label = t("agenda.todayGroup", { date: formattedDate });
      } else if (dateKey === tomorrowStr) {
        label = t("agenda.tomorrowGroup", { date: formattedDate });
      }

      groups.push({ dateKey, label, events });
    }

    return groups;
  }, [scheduledWorkouts, coachingAppointments, i18n.language, t]);

  const handleStartWorkout = (sw: ScheduledWorkout, e: React.MouseEvent) => {
    e.stopPropagation();
    startWorkout(sw.id, {
      onSuccess: (session: any) => {
        if (session?.id) {
          navigate(`/sessions/${session.id}/active`);
        } else {
          navigate("/sessions/active");
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-[#5BE584] border border-[#5BE584]/20">
            <CheckCircle2 size={12} /> {t("status.completed")}
          </span>
        );
      case "MISSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={12} /> {t("status.missed")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {t("status.cancelled")}
          </span>
        );
      case "RESCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw size={12} /> {t("status.rescheduled")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock size={12} /> {t("status.scheduled")}
          </span>
        );
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString(
        i18n.language === "ar" ? "ar-EG" : "en-US",
        { hour: "numeric", minute: "2-digit" },
      );
    } catch {
      return "";
    }
  };

  if (groupedEvents.length === 0) {
    return (
      <div className="bg-[#101418] border border-[#1E2329] rounded-2xl p-12 text-center shadow-xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16291D] border border-[#23422E] text-[#5BE584] mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-white">{t("agenda.noEventsTitle")}</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
          {isCoachView
            ? t("agenda.noEventsCoachDescription")
            : t("agenda.noEventsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map((group) => (
        <div key={group.dateKey} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#5BE584]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {group.label}
            </h4>
            <div className="flex-1 h-px bg-[#1E2329]" />
          </div>

          {/* Events in this date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.events.map((event) => {
              if (event.kind === "appointment") {
                const appt = event.data;
                const startTime = formatTime(appt.startTime);
                const endTime = formatTime(appt.endTime);

                return (
                  <div
                    key={appt.id}
                    onClick={() => onSelectAppointment(appt)}
                    className="p-4 rounded-2xl bg-[#101418] hover:bg-[#13181E] border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all shadow-lg group text-left rtl:text-right"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                            {t("events.coachingAppointment")}
                          </span>
                          <h5 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            {appt.title}
                          </h5>
                        </div>
                      </div>
                      {getStatusBadge(appt.status)}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={13} className="text-purple-400 shrink-0" />
                        <span>
                          {startTime} – {endTime}
                        </span>
                      </div>

                      {appt.location && (
                        <div className="flex items-center gap-1.5 text-gray-400 truncate">
                          <MapPin size={13} className="text-purple-400 shrink-0" />
                          <span className="truncate">{appt.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#1E2329] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <User size={13} className="text-purple-400 shrink-0" />
                        <span>
                          {isCoachView && appt.member
                            ? t("events.athleteLabel", { name: appt.member.name })
                            : appt.trainer
                            ? t("events.coachLabel", { name: appt.trainer.name })
                            : t("events.oneOnOne")}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                        {t("events.details")} <ArrowRight size={12} className="rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                );
              }

              // Workout Card
              const sw = event.data;
              const timeStr = formatTime(sw.scheduledAt);

              return (
                <div
                  key={sw.id}
                  onClick={() => onSelectWorkout(sw)}
                  className="p-4 rounded-2xl bg-[#101418] hover:bg-[#13181E] border border-[#1E2329] hover:border-[#2A323D] cursor-pointer transition-all shadow-lg group text-left rtl:text-right"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584] shrink-0">
                        <Dumbbell size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {t("events.trainingSession")}
                        </span>
                        <h5 className="text-sm font-bold text-white group-hover:text-[#5BE584] transition-colors">
                          {sw.workout?.title || t("events.defaultWorkoutTitle")}
                        </h5>
                      </div>
                    </div>
                    {getStatusBadge(sw.status)}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#5BE584] shrink-0" />
                      <span>{timeStr}</span>
                    </div>
                    <div>
                      {t("events.exercisesPlanned", {
                        count: sw.workout?.exercises?.length || 0,
                      })}
                    </div>
                    {sw.trainer && (
                      <div className="text-emerald-400 font-medium">
                        {t("events.coachAssigned")}
                      </div>
                    )}
                  </div>

                  {sw.notes && (
                    <div className="mt-2 text-xs text-gray-400 line-clamp-1 italic">
                      "{sw.notes}"
                    </div>
                  )}

                  {/* Footer & Quick Actions */}
                  <div className="mt-3 pt-3 border-t border-[#1E2329] flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {isCoachView && sw.member && (
                        <span>
                          {t("events.athleteLabel", { name: sw.member.name })}
                        </span>
                      )}
                    </div>

                    {!isCoachView &&
                      (sw.status === "SCHEDULED" ||
                        sw.status === "RESCHEDULED" ||
                        sw.status === "MISSED") && (
                        <button
                          type="button"
                          onClick={(e) => handleStartWorkout(sw, e)}
                          disabled={isStarting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#4dd273] text-black shadow-md shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Play size={12} className="fill-black" />
                          {t("events.start")}
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
