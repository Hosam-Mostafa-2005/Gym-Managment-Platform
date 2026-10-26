// src/features/coach-dashboard/components/assignments/UpcomingCoachSchedules.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Dumbbell, ChevronRight, FileText, CalendarDays } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { formatMemberDisplay } from "@/features/users/utils/user-display";
import type { UpcomingScheduledWorkout } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface UpcomingCoachSchedulesProps {
  schedules?: UpcomingScheduledWorkout[];
}

export const UpcomingCoachSchedules: React.FC<UpcomingCoachSchedulesProps> = ({
  schedules = [],
}) => {
  const hasSchedules = schedules && schedules.length > 0;

  return (
    <div className="flex flex-col rounded-xl border border-[#1e2329] bg-[#0d1014] p-5 transition-colors hover:border-[#2a313a]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-100">
            Upcoming Member Workouts
          </h3>
          <InfoTooltip
            title="Scheduled Member Workouts"
            description="Upcoming workouts scheduled on the calendar by members in your assigned roster."
            calculation="Scheduled workouts where member is assigned to coach AND scheduledAt >= NOW()"
            unit="calendar sessions"
            dateRange="Upcoming 7–30 days"
            limitations="Enables proactive coaching check-ins before planned workouts."
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/coach/schedule"
            className="flex items-center gap-1 text-xs font-medium text-[#5BE584] hover:underline"
            title="Open full interactive calendar"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Calendar</span>
          </Link>
          <span className="text-gray-600 text-xs">•</span>
          <Link
            to="/coach/schedule/new"
            className="flex items-center gap-1 text-xs font-medium text-gray-300 hover:text-white"
            title="Schedule a workout using dedicated form"
          >
            <FileText className="h-3.5 w-3.5 text-[#5BE584]" />
            <span>Form</span>
          </Link>
          <span className="text-gray-600 text-xs">•</span>
          <Link
            to="/members"
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-200"
          >
            <span>Roster</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {hasSchedules ? (
        <div className="flex flex-col gap-2.5">
          {schedules.map((schedule) => {
            const date = new Date(schedule.scheduledAt);
            const dateStr = date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const timeStr = date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            const display = formatMemberDisplay(schedule.member || {});

            return (
              <div
                key={schedule.id}
                className="flex items-center justify-between rounded-lg border border-[#1e2329] bg-[#101418] p-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#23422e] bg-[#16291d] text-[#5BE584] font-bold text-xs">
                    {display.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-gray-100 truncate">
                        {display.displayName}
                      </span>
                      {display.isTestAccount && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono shrink-0">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-gray-400 truncate">
                      <Dumbbell className="h-3 w-3 text-gray-500 shrink-0" />
                      <span className="truncate">{schedule.workout?.title || "Routine"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span className="font-mono text-[#5BE584] font-medium block">
                    {dateStr}
                  </span>
                  <span className="text-[10px] text-gray-500">{timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#1e2329] py-8 text-center text-xs text-gray-500">
          <Calendar className="h-6 w-6 text-gray-600 mb-1" />
          <span>No upcoming workouts scheduled by your athletes.</span>
          <div className="flex items-center gap-2 mt-2">
            <Link
              to="/coach/schedule/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16291D] border border-[#23422E] text-[#5BE584] text-xs font-semibold hover:bg-[#1f3a29] transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Schedule with Form
            </Link>
            <Link
              to="/coach/schedule"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12161D] border border-[#1E2329] text-gray-300 text-xs font-medium hover:text-white transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar View
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
