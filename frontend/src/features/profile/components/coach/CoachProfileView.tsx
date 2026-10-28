// src/features/profile/components/coach/CoachProfileView.tsx
import React, { useState } from "react";
import { Lock, BookOpen, Globe } from "lucide-react";
import { ProfileHeader } from "../shared/ProfileHeader";
import { ChangePasswordDialog } from "../shared/ChangePasswordDialog";
import { EditCoachProfileDialog } from "./EditCoachProfileDialog";
import { CoachOverview } from "./CoachOverview";
import { MemberStats } from "./MemberStats";
import { CoachWorkoutStats } from "./CoachWorkoutStats";
import { CoachCharts } from "./CoachCharts";
import { Achievements } from "./Achievements";
import { RecentActivity } from "./RecentActivity";
import { UpcomingTasks } from "./UpcomingTasks";
import { useAuthStore } from "@/store/auth.store";
import type { CoachProfileResponse } from "../../types/profile.types";

interface CoachProfileViewProps {
  data: CoachProfileResponse;
}

export const CoachProfileView: React.FC<CoachProfileViewProps> = ({ data }) => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    profile,
    overview,
    memberStats,
    workoutStats,
    charts,
    recentActivity,
    achievements,
    upcomingTasks,
  } = data;

  const currentUser = useAuthStore((state) => state.user);
  const effectiveAvatar =
    profile.avatarUrl ??
    (currentUser?.id === profile.id || (currentUser as any)?._id === profile.id
      ? currentUser?.avatarUrl
      : null);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Profile Hero Header */}
      <ProfileHeader
        name={profile.name}
        image={effectiveAvatar}
        role={profile.professionalTitle || "Senior Head Coach"}
        email={profile.email}
        subtitle={
          profile.bio ||
          "Specialized in biomechanics, hypertrophy microcycles, and high-intensity conditioning protocols."
        }
        joinedDate={new Date(profile.joinedAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPasswordDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#1e2329] bg-[#161b22] px-3.5 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-[#1e2329] hover:text-[#5BE584] cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              Security
            </button>
            <button
              type="button"
              onClick={() => setIsEditDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-colors hover:bg-[#4ade80] cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        }
      >
        {((profile.specialties && profile.specialties.length > 0) ||
          (profile.certifications && profile.certifications.length > 0) ||
          Boolean(profile.coachingPhilosophy) ||
          (profile.languagesSpoken && profile.languagesSpoken.length > 0)) && (
          <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-[#1e2329]/60">
            {profile.coachingPhilosophy && (
              <div className="flex items-start gap-2 text-xs text-gray-300">
                <BookOpen className="w-3.5 h-3.5 text-[#5BE584] mt-0.5 shrink-0" />
                <span className="italic text-gray-400">
                  &ldquo;{profile.coachingPhilosophy}&rdquo;
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {profile.specialties && profile.specialties.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Core Specialties
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="rounded bg-[#13171d] border border-[#1e2329] px-2 py-0.5 text-[11px] text-gray-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.certifications && profile.certifications.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Certifications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="rounded bg-[#16291d] border border-[#23422e] px-2 py-0.5 text-[11px] text-[#5BE584]"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.languagesSpoken && profile.languagesSpoken.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#5BE584]" />
                    Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.languagesSpoken.map((lang, i) => (
                      <span
                        key={i}
                        className="rounded bg-[#13171d] border border-[#1e2329] px-2 py-0.5 text-[11px] text-gray-400"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ProfileHeader>

      {/* 2. Overview KPI Cards */}
      <CoachOverview overview={overview} />

      {/* 3. Member Demographic Stats */}
      <MemberStats memberStats={memberStats} />

      {/* 4. Performance Charts Section */}
      <CoachCharts charts={charts} />

      {/* 5. Workout Statistics Matrix */}
      <CoachWorkoutStats workoutStats={workoutStats} />

      {/* 6. Achievements & Accreditations */}
      <Achievements achievements={achievements} />

      {/* 7. Recent Activity & 8. Upcoming Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity recentActivity={recentActivity} />
        <UpcomingTasks upcomingTasks={upcomingTasks} />
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditCoachProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialData={profile}
      />

      {/* Change Password / Security Dialog */}
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        userEmail={profile.email}
      />
    </div>
  );
};

export default CoachProfileView;
