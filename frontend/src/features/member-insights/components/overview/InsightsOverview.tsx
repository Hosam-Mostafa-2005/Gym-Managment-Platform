// src/features/member-insights/components/overview/InsightsOverview.tsx

import React from "react";
import { Scale, Percent, CheckCircle2, Database, Clock } from "lucide-react";
import { InsightStatCard } from "../shared/InsightStatCard";
import type { MemberInsightsKPIs } from "../../types/member-insights.types";

interface InsightsOverviewProps {
  kpis: MemberInsightsKPIs;
}

export const InsightsOverview: React.FC<InsightsOverviewProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <InsightStatCard
        label="Current Weight"
        value={`${kpis.currentWeight} kg`}
        icon={<Scale className="h-4 w-4" />}
        trend={{ value: kpis.weightDifference, suffix: " kg" }}
        description="Latest recorded mass"
      />
      <InsightStatCard
        label="Body Fat"
        value={`${kpis.currentBodyFat}%`}
        icon={<Percent className="h-4 w-4" />}
        trend={{ value: kpis.bodyFatDifference, suffix: "%" }}
        description="Latest recorded composition"
      />
      <InsightStatCard
        label="Completion Rate"
        value={`${kpis.completionRate.toFixed(1)}%`}
        icon={<CheckCircle2 className="h-4 w-4" />}
        description={`${kpis.completedSessions} / ${kpis.totalSessions} Sessions`}
      />
      <InsightStatCard
        label="Total Volume"
        value={kpis.totalWorkoutVolume.toLocaleString()}
        icon={<Database className="h-4 w-4" />}
        description="Total kg displaced"
      />
      <InsightStatCard
        label="Avg Duration"
        value={`${kpis.averageWorkoutDuration} min`}
        icon={<Clock className="h-4 w-4" />}
        description="Per completed session"
      />
    </div>
  );
};
