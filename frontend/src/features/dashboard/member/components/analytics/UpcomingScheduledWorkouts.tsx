// src/features/dashboard/member/components/analytics/UpcomingScheduledWorkouts.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Play, Dumbbell, ChevronRight } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useStartScheduledWorkout } from "@/features/scheduling/hooks/useScheduling";
import { toast } from "sonner";
import type { UpcomingScheduledWorkout } from "@/features/dashboard/types/dashboard.types";

interface UpcomingScheduledWorkoutsProps {
  schedules?: UpcomingScheduledWorkout[];
}

export const UpcomingScheduledWorkouts: React.FC<
  UpcomingScheduledWorkoutsProps
> = ({ schedules = [] }) => {
  const navigate = useNavigate();
  const { mutate: startScheduled, isPending } = useStartScheduledWorkout();
  const hasSchedules = schedules && schedules.length > 0;

  const handleStartSchedule = (scheduleId: string) => {
    startScheduled(scheduleId, {
      onSuccess: () => navigate("/sessions/active"),
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || "Failed to start scheduled workout.",
        );
      },
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 transition-colors hover:border-[#2A313A]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">
            Upcoming Scheduled Workouts
          </h2>
          <InfoTooltip
            title="Scheduled Training Calendar"
            description="Upcoming workouts scheduled on the calendar by you or assigned by your coach."
            calculation="Scheduled workouts where scheduledAt >= today AND status IN ('SCHEDULED', 'RESCHEDULED')"
            unit="calendar events"
            dateRange="Upcoming 7–30 days"
            limitations="Completed sessions move to your training log."
          />
        </div>
        <Link
          to="/calendar"
          className="flex items-center gap-1 text-xs font-medium text-[#5BE584] hover:underline"
        >
          <span>Open Calendar</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {hasSchedules ? (
        <div className="flex flex-col gap-3">
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

            return (
              <div
                key={schedule.id}
                className="flex flex-col gap-3 rounded-lg border border-[#1E2329] bg-[#101418] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#23422E] bg-[#16291D] text-[#5BE584]">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {schedule.workout?.title || "Scheduled Routine"}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="font-mono text-[#5BE584]">
                        {dateStr} at {timeStr}
                      </span>
                      {schedule.workout?.category && (
                        <span className="rounded bg-[#1E2329] px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-300">
                          {schedule.workout.category}
                        </span>
                      )}
                      {schedule.workout?.difficulty && (
                        <span className="rounded bg-[#1E2329] px-2 py-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                          {schedule.workout.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartSchedule(schedule.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-lg border border-[#23422E] bg-[#16291D] px-3 py-1.5 text-xs font-semibold text-[#5BE584] transition-colors hover:bg-[#1E3827] disabled:opacity-50"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Start Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#1E2329] py-8 text-center text-sm text-gray-500">
          <Calendar className="h-8 w-8 text-gray-600" />
          <span>No upcoming workouts scheduled.</span>
          <span className="text-xs text-gray-600">
            Schedule a routine on your calendar to plan ahead.
          </span>
          <div className="mt-2 flex items-center gap-2">
            <Link
              to="/workout-builder/all"
              className="rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-[#5BE584] hover:text-[#5BE584]"
            >
              Browse Workouts
            </Link>
            <Link
              to="/calendar"
              className="rounded-lg bg-[#5BE584]/15 px-3 py-1.5 text-xs font-semibold text-[#5BE584] transition-colors hover:bg-[#5BE584]/25"
            >
              Open Calendar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
