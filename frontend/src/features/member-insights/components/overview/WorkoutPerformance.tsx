// src/features/member-insights/components/overview/WorkoutPerformance.tsx

import React from "react";
import { WorkoutCompletionChart } from "../workouts/WorkoutCompletionChart";
import { TrainingActivityChart } from "../activity/TrainingActivityChart";
import type { MemberInsightsKPIs } from "../../types/member-insights.types";

interface WorkoutPerformanceProps {
  kpis: MemberInsightsKPIs;
}

export const WorkoutPerformance: React.FC<WorkoutPerformanceProps> = ({
  kpis,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-6">
      <h3 className="text-sm font-semibold text-gray-100">
        Detailed Performance
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <WorkoutCompletionChart
          completedSessions={kpis.completedSessions}
          totalSessions={kpis.totalSessions}
          completionRate={kpis.completionRate}
        />
        <TrainingActivityChart
          totalWorkoutVolume={kpis.totalWorkoutVolume}
          averageWorkoutDuration={kpis.averageWorkoutDuration}
        />
      </div>
    </div>
  );
};
