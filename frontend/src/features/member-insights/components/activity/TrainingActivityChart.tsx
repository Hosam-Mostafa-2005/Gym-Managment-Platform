// src/features/member-insights/components/activity/TrainingActivityChart.tsx

import React from "react";
import { Database, Clock } from "lucide-react";

interface TrainingActivityChartProps {
  totalWorkoutVolume: number;
  averageWorkoutDuration: number;
}

export const TrainingActivityChart: React.FC<TrainingActivityChartProps> = ({
  totalWorkoutVolume,
  averageWorkoutDuration,
}) => {
  return (
    <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#090B0F] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Activity Summary
        </h4>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#16291d] p-2 text-[#5BE584] border border-[#23422e]">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                Aggregate Volume
              </span>
              <span className="text-xs text-gray-500">Total displacement</span>
            </div>
          </div>
          <span className="font-mono text-base font-semibold text-gray-100">
            {totalWorkoutVolume.toLocaleString()} kg
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#1E2329] p-2 text-gray-400 border border-[#2A313A]">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                Mean Duration
              </span>
              <span className="text-xs text-gray-500">
                Per completed session
              </span>
            </div>
          </div>
          <span className="font-mono text-base font-semibold text-gray-100">
            {averageWorkoutDuration} min
          </span>
        </div>
      </div>
    </div>
  );
};
