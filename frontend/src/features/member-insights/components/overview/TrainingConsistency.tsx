// src/features/member-insights/components/overview/TrainingConsistency.tsx

import React from "react";
import {
  Flame,
  Trophy,
  Calendar,
  Clock,
  RefreshCcw,
  UserCheck,
} from "lucide-react";
import type { WorkoutInsights } from "../../types/member-insights.types";

interface TrainingConsistencyProps {
  insights: WorkoutInsights;
}

export const TrainingConsistency: React.FC<TrainingConsistencyProps> = ({
  insights,
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-6">
      <h3 className="text-sm font-semibold text-gray-100">Workout Insights</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> Active Streak
          </div>
          <span className="font-mono text-lg font-bold text-gray-100">
            {insights.currentStreak} Days
          </span>
          <span className="text-[10px] text-gray-500">
            Consecutive adherence
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" /> Longest Streak
          </div>
          <span className="font-mono text-lg font-bold text-gray-100">
            {insights.longestStreak} Days
          </span>
          <span className="text-[10px] text-gray-500">Personal record</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" /> Last Session
          </div>
          <span className="text-sm font-bold text-gray-100 mt-1">
            {formatDate(insights.lastWorkout)}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">
            Most recent log
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Clock className="h-3.5 w-3.5 text-gray-400" /> Avg Rest Days
          </div>
          <span className="font-mono text-lg font-bold text-gray-100">
            {insights.averageRestDays.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-500">Between sessions</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <RefreshCcw className="h-3.5 w-3.5 text-gray-400" /> Frequency
          </div>
          <span className="font-mono text-lg font-bold text-gray-100">
            {insights.workoutFrequency.toFixed(1)}{" "}
            <span className="text-xs text-gray-500 font-sans">/wk</span>
          </span>
          <span className="text-[10px] text-gray-500">Average cadence</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <UserCheck className="h-3.5 w-3.5 text-[#5BE584]" /> Attendance %
          </div>
          <span className="font-mono text-lg font-bold text-[#5BE584]">
            {insights.attendancePercentage.toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-500">Overall adherence</span>
        </div>
      </div>
    </div>
  );
};
