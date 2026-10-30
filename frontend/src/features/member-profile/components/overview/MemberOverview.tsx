// src/features/member-profile/components/overview/MemberOverview.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import type { MemberOverview as MemberOverviewType } from "../../types/member-profile.types";
import { CurrentAssignment } from "./CurrentAssignment";
import { WorkoutStats } from "./WorkoutStats";
import { LatestMeasurement } from "./LatestMeasurement";

interface MemberOverviewProps {
  overview: MemberOverviewType;
}

export const MemberOverview: React.FC<MemberOverviewProps> = ({ overview }) => {
  const { t } = useTranslation(["profile"]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        {t("rosterMemberView.overview")}
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <CurrentAssignment
            assignment={overview.currentAssignment}
            activeAssignments={overview.activeAssignments}
          />
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

export default MemberOverview;
