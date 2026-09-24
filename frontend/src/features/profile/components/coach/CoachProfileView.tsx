// src/features/profile/components/coach/CoachProfileView.tsx
import React from "react";
import { ProfileHeader } from "../shared/ProfileHeader";
import { CoachOverview } from "./CoachOverview";
import { MemberStats } from "./MemberStats";
import { CoachWorkoutStats } from "./CoachWorkoutStats";
import { CoachCharts } from "./CoachCharts";
import { Achievements } from "./Achievements";
import { RecentActivity } from "./RecentActivity";
import { UpcomingTasks } from "./UpcomingTasks";
import type { CoachProfileResponse } from "../../types/profile.types";

interface CoachProfileViewProps {
  data: CoachProfileResponse;
}

export const CoachProfileView: React.FC<CoachProfileViewProps> = ({ data }) => {
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

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Profile Hero Header */}
      <ProfileHeader
        name={profile.name}
        role="Senior Head Coach"
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
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-colors hover:bg-[#4ade80]"
          >
            Edit Profile
          </button>
        }
      >
        {(profile.specialties?.length > 0 ||
          profile.certifications?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-2">
            {profile.specialties?.length > 0 && (
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
            {profile.certifications?.length > 0 && (
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
    </div>
  );
};
