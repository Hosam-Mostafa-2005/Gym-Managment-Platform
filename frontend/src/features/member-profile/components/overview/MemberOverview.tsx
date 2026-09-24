// src/features/member-profile/components/overview/MemberOverview.tsx

import React from "react";
import type { MemberOverview as MemberOverviewType } from "../../types/member-profile.types";
import { CurrentAssignment } from "./CurrentAssignment";
import { WorkoutStats } from "./WorkoutStats";
import { LatestMeasurement } from "./LatestMeasurement";

interface MemberOverviewProps {
  overview: MemberOverviewType;
}

export const MemberOverview: React.FC<MemberOverviewProps> = ({ overview }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">Overview</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <CurrentAssignment assignment={overview.currentAssignment} />
        </div>
        <div className="lg:col-span-4">
          <WorkoutStats stats={overview.workoutStats} />
        </div>
        <div className="lg:col-span-3">
          <LatestMeasurement measurement={overview.latestMeasurement} />
        </div>
      </div>
    </div>
  );
};
