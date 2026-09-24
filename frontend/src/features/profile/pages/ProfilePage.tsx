// src/features/profile/pages/ProfilePage.tsx
import React from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"; // Updated to use the actual auth hook from project
import { MemberProfileContainer } from "../components/member/MemberProfileContainer";
import { CoachProfileContainer } from "../components/coach/CoachProfileContainer";
import { ProfileLoading } from "../components/states/ProfileLoading";

const ProfilePage: React.FC = () => {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  console.log("PROFILE USER:", user);
  console.log("PROFILE ROLE:", user?.role);
  if (isAuthLoading) {
    return <ProfileLoading />;
  }

  const role = user.role?.toUpperCase();
  const memberId = user.id || user._id || "";

  const isMember = role === "MEMBER";

  return (
    <div className="min-h-full w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {isMember ? (
        <MemberProfileContainer memberId={memberId} />
      ) : (
        <CoachProfileContainer />
      )}
    </div>
  );
};

export default ProfilePage;
