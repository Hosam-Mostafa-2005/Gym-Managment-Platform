// src/features/profile/components/coach/CoachProfileContainer.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useCoachProfile } from "../../hooks/use-coach-profile";
import { ProfileLoading } from "../states/ProfileLoading";
import { ProfileError } from "../states/ProfileError";
import { CoachProfileView } from "./CoachProfileView";

export const CoachProfileContainer: React.FC = () => {
  const { t } = useTranslation(["profile"]);
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
            : t("states.coachErrorDefault")
        }
        onRetry={() => refetch()}
      />
    );
  }

  return <CoachProfileView data={data} />;
};
