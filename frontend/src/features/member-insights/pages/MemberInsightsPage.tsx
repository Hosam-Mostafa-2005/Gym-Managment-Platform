// src/features/member-insights/pages/MemberInsightsPage.tsx

import React from "react";
import { useParams } from "react-router-dom";
import { useMemberInsights } from "../hooks/use-member-insights";

import { InsightsHeader } from "../components/shared/InsightsHeader";
import { InsightsOverview } from "../components/overview/InsightsOverview";
import { WorkoutPerformance } from "../components/overview/WorkoutPerformance";
import { TrainingConsistency } from "../components/overview/TrainingConsistency";
import { BodyChanges } from "../components/measurements/BodyChanges";

import { WeightProgressChart } from "../components/measurements/WeightProgressChart";
import { BodyFatProgressChart } from "../components/measurements/BodyFatProgressChart";
import { WorkoutVolumeChart } from "../components/workouts/WorkoutVolumeChart";
import { WorkoutDurationChart } from "../components/workouts/WorkoutDurationChart";
import { MemberTimeline } from "../components/timeline/MemberTimeline";

import { InsightsLoading } from "../components/states/InsightsLoading";
import { InsightsError } from "../components/states/InsightsError";
import { InsightsEmpty } from "../components/states/InsightsEmpty";

const MemberInsightsPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const { data, isLoading, isError, error, refetch } =
    useMemberInsights(memberId);

  if (isLoading) return <InsightsLoading />;

  if (isError) {
    return (
      <InsightsError
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) return <InsightsEmpty />;

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <InsightsHeader />

        <InsightsOverview kpis={data.kpis} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <WorkoutVolumeChart data={data.charts.workoutVolume} />
          <WorkoutDurationChart data={data.charts.workoutDuration} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <WeightProgressChart data={data.charts.weight} />
          <BodyFatProgressChart data={data.charts.bodyFat} />
        </div>

        <BodyChanges insights={data.bodyInsights} />

        <WorkoutPerformance kpis={data.kpis} />

        <TrainingConsistency insights={data.workoutInsights} />

        <MemberTimeline timeline={data.timeline} />
      </div>
    </div>
  );
};

export default MemberInsightsPage;
