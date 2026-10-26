// src/features/profile/pages/ProfilePage.tsx
import React from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAuthStore } from "@/store/auth.store";
import { MemberProfileContainer } from "../components/member/MemberProfileContainer";
import { CoachProfileContainer } from "../components/coach/CoachProfileContainer";
import { ProfileLoading } from "../components/states/ProfileLoading";

const ProfilePage: React.FC = () => {
  const { data: userFromQuery, isLoading: isAuthLoading } = useCurrentUser();
  const userFromStore = useAuthStore((state) => state.user);

  const user = userFromQuery || userFromStore;

  if (isAuthLoading && !user) {
    return <ProfileLoading />;
  }

  const role = user?.role?.toUpperCase();
  const memberId = user?.id || (user as any)?._id || "";

  // Never default an undefined or unresolved coach to the member container
  const isCoachOrAdmin = role === "TRAINER" || role === "ADMIN";
  const isMember = role === "MEMBER";

  return (
    <div className="min-h-full w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {isCoachOrAdmin ? (
        <CoachProfileContainer />
      ) : isMember ? (
        <MemberProfileContainer memberId={memberId} />
      ) : (
        <ProfileLoading />
      )}
    </div>
  );
};

export default ProfilePage;
