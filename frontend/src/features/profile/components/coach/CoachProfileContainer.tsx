// src/features/profile/components/coach/CoachProfileContainer.tsx
import React from "react";
import { useCoachProfile } from "../../hooks/use-coach-profile";
import { ProfileLoading } from "../states/ProfileLoading";
import { ProfileError } from "../states/ProfileError";
import { CoachProfileView } from "./CoachProfileView";

export const CoachProfileContainer: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useCoachProfile();
  if (isLoading) {
    return <ProfileLoading />;
  }

  if (isError || !data) {
    return (
      <ProfileError
        message={
          error instanceof Error
            ? error.message
            : "Unable to retrieve coach profile telemetry."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return <CoachProfileView data={data} />;
};
