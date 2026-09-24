// src/features/member-profile/pages/MemberProfilePage.tsx

import React from "react";
import { useParams } from "react-router-dom";
import { useMemberProfile } from "../hooks/use-member-profile";

import { MemberProfileLoading } from "../components/states/MemberProfileLoading";
import { MemberProfileError } from "../components/states/MemberProfileError";
import { MemberProfileEmpty } from "../components/states/MemberProfileEmpty";

import { MemberProfileHeader } from "../components/shared/MemberProfileHeader";
import { MemberOverview } from "../components/overview/MemberOverview";
import { MeasurementHistory } from "../components/measurements/MeasurementHistory";
import { RecentSessions } from "../components/sessions/RecentSessions";
import { AssignmentHistory } from "../components/assignments/AssignmentHistory";
import { MemberTimeline } from "../components/timeline/MemberTimeline";

const MemberProfilePage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const { data, isLoading, isError, error, refetch } =
    useMemberProfile(memberId);

  if (isLoading) {
    return <MemberProfileLoading />;
  }

  if (isError) {
    return (
      <MemberProfileError
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data) {
    return <MemberProfileEmpty />;
  }

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
        <MemberProfileHeader member={data.member} />

        <MemberOverview overview={data.overview} />

        <MeasurementHistory measurements={data.measurementHistory} />

        <RecentSessions sessions={data.recentSessions} />

        <AssignmentHistory assignments={data.assignmentHistory} />

        <MemberTimeline timeline={data.timeline} />
      </div>
    </div>
  );
};

export default MemberProfilePage;
