// src/features/profile/components/member/MemberProfileContainer.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useMemberProfile } from "../../hooks/use-member-profile";
import { ProfileLoading } from "../states/ProfileLoading";
import { ProfileError } from "../states/ProfileError";
import { MemberProfileView } from "./MemberProfileView";

interface MemberProfileContainerProps {
  memberId: string;
}

export const MemberProfileContainer: React.FC<MemberProfileContainerProps> = ({
  memberId,
}) => {
  const { t } = useTranslation(["profile"]);
  const { data, isLoading, isError, error, refetch } =
    useMemberProfile(memberId);

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (isError || !data) {
    return (
      <ProfileError
        message={
          error instanceof Error
            ? error.message
            : t("states.memberErrorDefault")
        }
        onRetry={() => refetch()}
      />
    );
  }

  return <MemberProfileView data={data} />;
};
