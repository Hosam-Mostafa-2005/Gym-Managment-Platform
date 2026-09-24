// src/features/member-insights/components/workouts/WorkoutCompletionChart.tsx

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface WorkoutCompletionChartProps {
  completedSessions: number;
  totalSessions: number;
  completionRate: number;
}

export const WorkoutCompletionChart: React.FC<WorkoutCompletionChartProps> = ({
  completedSessions,
  totalSessions,
  completionRate,
}) => {
  return (
    <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#090B0F] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Completion Summary
        </h4>
        <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-100 font-mono">
            {completionRate.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">Overall Fidelity</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-sm font-semibold text-gray-200">
            {completedSessions} / {totalSessions}
          </span>
          <span className="text-xs text-gray-500">Sessions Completed</span>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1E2329]">
        <div
          className="h-full bg-[#5BE584] transition-all duration-500"
          style={{ width: `${Math.min(Math.max(completionRate, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};
