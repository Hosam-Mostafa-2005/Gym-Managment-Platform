// src/features/profile/components/member/MemberProfileView.tsx
import React from "react";
import { ProfileHeader } from "../shared/ProfileHeader";
import { ProfileSection } from "../shared/ProfileSection";
import { MemberOverview } from "./MemberOverview";
import { CurrentAssignment } from "./CurrentAssignment";
import { MeasurementHistory } from "./MeasurementHistory";
import { RecentSessions } from "./RecentSessions";
import { AssignmentHistory } from "./AssignmentHistory";
import { MemberTimeline } from "./MemberTimeline";
import { User, Mail, Shield, Lock } from "lucide-react";
import type { MemberProfileResponse } from "../../types/profile.types";

interface MemberProfileViewProps {
  data: MemberProfileResponse;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  data,
}) => {
  const {
    member,
    overview,
    assignmentHistory,
    measurementHistory,
    recentSessions,
    timeline,
  } = data;
  const { currentAssignment, latestMeasurement, workoutStats } = overview;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <ProfileHeader
        name={member.name}
        role={member.role || "Member"}
        email={member.email}
        isActive={member.isActive}
        joinedDate={formatDate(member.createdAt)}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-colors hover:bg-[#4ade80]"
          >
            Edit Profile
          </button>
        }
      >
        {latestMeasurement && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Current Weight
              </span>
              <span className="text-lg font-bold text-gray-100 font-mono mt-0.5">
                {latestMeasurement.weight !== null
                  ? `${latestMeasurement.weight} kg`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Body Fat %
              </span>
              <span className="text-lg font-bold text-gray-100 font-mono mt-0.5">
                {latestMeasurement.bodyFat !== null
                  ? `${latestMeasurement.bodyFat}%`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Standing Height
              </span>
              <span className="text-lg font-bold text-gray-100 font-mono mt-0.5">
                {latestMeasurement.height !== null
                  ? `${latestMeasurement.height} cm`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Active Routine
              </span>
              <span className="text-sm font-semibold text-gray-200 truncate mt-1">
                {currentAssignment?.workout?.title || "No active program"}
              </span>
            </div>
          </div>
        )}
      </ProfileHeader>

      {/* Overview KPI Cards */}
      <MemberOverview workoutStats={workoutStats} />

      {/* Current Assignment */}
      <CurrentAssignment assignment={currentAssignment} />

      {/* Personal Info & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileSection
            title="Personal Information"
            subtitle="Basic identification & baseline records"
            icon={User}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Full Legal Name
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {member.name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Primary Email Address
                </span>
                <span className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-gray-500" />
                  {member.email}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Account ID
                </span>
                <span className="text-sm font-medium text-gray-200 font-mono">
                  #{member.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Account Status
                </span>
                <span className="text-sm font-medium text-emerald-400">
                  {member.isActive ? "Verified Active Member" : "Inactive"}
                </span>
              </div>
            </div>
          </ProfileSection>
        </div>

        <div>
          <ProfileSection title="Account Security" icon={Shield}>
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#13171d] border border-[#1e2329]">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-[#5BE584]" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-200">
                      Password & Auth
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Secured via JWT standard
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Secured
                </span>
              </div>
            </div>
          </ProfileSection>
        </div>
      </div>

      {/* Measurement History & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeasurementHistory measurements={measurementHistory} />
        <RecentSessions sessions={recentSessions} />
      </div>

      {/* Assignment History & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentHistory assignments={assignmentHistory} />
        <MemberTimeline timeline={timeline} />
      </div>
    </div>
  );
};
