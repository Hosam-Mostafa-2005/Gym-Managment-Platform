// src/features/profile/components/member/MemberProfileView.tsx
import React, { useState } from "react";
import { ProfileHeader } from "../shared/ProfileHeader";
import { ProfileSection } from "../shared/ProfileSection";
import { MemberOverview } from "./MemberOverview";
import { CurrentAssignment } from "./CurrentAssignment";
import { MeasurementHistory } from "./MeasurementHistory";
import { RecentSessions } from "./RecentSessions";
import { AssignmentHistory } from "./AssignmentHistory";
import { MemberTimeline } from "./MemberTimeline";
import { EditProfileDialog } from "./EditProfileDialog";
import { ChangePasswordDialog } from "../shared/ChangePasswordDialog";
import { CoachingConsentCard } from "../../../coaching-relationships/components/CoachingConsentCard";
import { PendingInvitationBanner } from "../../../coaching-relationships/components/PendingInvitationBanner";
import { User, Mail, Shield, Lock, Phone, Target, Dumbbell } from "lucide-react";
import type { MemberProfileResponse } from "../../types/profile.types";

const GOAL_LABELS: Record<string, string> = {
  STRENGTH_HYPERTROPHY: "Strength & Muscle Building",
  FAT_LOSS_LEANING: "Fat Loss & Conditioning",
  ATHLETIC_PERFORMANCE: "Athletic Performance",
  HEALTH_LONGEVITY: "General Fitness & Health",
};

const EXP_LABELS: Record<string, string> = {
  BEGINNER: "Beginner (< 1 yr)",
  INTERMEDIATE: "Intermediate (1–3 yrs)",
  ADVANCED: "Advanced (3+ yrs)",
};

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

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
      {/* Pending Invitation Banner if any */}
      <PendingInvitationBanner />

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
            onClick={() => setIsEditOpen(true)}
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

      {/* Active Coaching Relationship & Privacy Management */}
      <CoachingConsentCard />

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
                  Phone Number
                </span>
                <span className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-gray-500" />
                  {(member as any).phone || "Not specified"}
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
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Target className="w-3 h-3 text-[#5BE584]" />
                  Primary Fitness Goal
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {(member as any).fitnessGoal
                    ? GOAL_LABELS[(member as any).fitnessGoal] || (member as any).fitnessGoal
                    : "Not specified"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-[#5BE584]" />
                  Experience Level
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {(member as any).experienceLevel
                    ? EXP_LABELS[(member as any).experienceLevel] || (member as any).experienceLevel
                    : "Not specified"}
                </span>
              </div>
              {(member as any).bio && (
                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Bio / Training Focus
                  </span>
                  <span className="text-sm font-medium text-gray-300 leading-relaxed">
                    {(member as any).bio}
                  </span>
                </div>
              )}
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
                      Password & Authentication
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {(member as any).hasPassword === false
                        ? "Google account connected"
                        : "Encrypted & secured via SHA-256 / bcrypt"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="rounded border border-[#1e2329] bg-[#161b22] px-2.5 py-1 text-xs font-semibold text-[#5BE584] hover:bg-[#1e2329] hover:text-white transition-colors cursor-pointer"
                >
                  {(member as any).hasPassword === false
                    ? "Set Password"
                    : "Change Password"}
                </button>
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

      {/* Edit Profile Modal Dialog */}
      <EditProfileDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        memberId={member.id}
        initialData={{
          name: member.name,
          phone: (member as any).phone,
          bio: (member as any).bio,
          fitnessGoal: (member as any).fitnessGoal,
          experienceLevel: (member as any).experienceLevel,
        }}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        userEmail={member.email}
        hasPassword={(member as any).hasPassword !== false}
        googleLinked={(member as any).googleLinked}
      />
    </div>
  );
};
