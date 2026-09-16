// src/features/coach-dashboard/components/performance/PerformanceTelemetry.tsx
import React from "react";
import { Activity } from "lucide-react";
import { WorkoutSessionsChart } from "./WorkoutSessionsChart";
import { CompletionRateChart } from "./CompletionRateChart";
import { AssignmentsChart } from "./AssignmentsChart";
import type { DashboardCharts } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface PerformanceTelemetryProps {
  charts: DashboardCharts;
}

export const PerformanceTelemetry: React.FC<PerformanceTelemetryProps> = ({
  charts,
}) => {
  return (
    <section
      className="mb-8 flex flex-col gap-4"
      aria-labelledby="performance-heading"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-[#1e2329] pb-3">
        <Activity className="h-4 w-4 text-gray-400" />
        <h2
          id="performance-heading"
          className="text-sm font-semibold text-gray-100"
        >
          Performance Telemetry
        </h2>
        <span className="text-[10px] font-medium text-gray-500 tracking-wider uppercase ml-auto">
          Rolling Window: Past 30 Days
        </span>
      </div>

      {/* Grid of Three Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <WorkoutSessionsChart data={charts?.sessions?.last30Days} />
        <CompletionRateChart data={charts?.completionRate?.last30Days} />
        <AssignmentsChart data={charts?.assignments?.last30Days} />
      </div>
    </section>
  );
};
