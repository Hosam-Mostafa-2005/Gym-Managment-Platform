// src/features/profile/components/member/MemberProfileView.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useAuthStore } from "@/store/auth.store";
import type { MemberProfileResponse } from "../../types/profile.types";

interface MemberProfileViewProps {
  data: MemberProfileResponse;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  data,
}) => {
  const { t, i18n } = useTranslation(["profile", "common"]);
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
    if (!dateStr) return "—";
    try {
      const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const currentUser = useAuthStore((state) => state.user);
  const effectiveAvatar =
    member.avatarUrl ??
    (currentUser?.id === member.id || (currentUser as any)?._id === member.id
      ? currentUser?.avatarUrl
      : null);

  const getFitnessGoalLabel = (goal?: string | null) => {
    if (!goal) return t("member.personalInfo.notSpecified");
    return t(`member.goals.${goal}` as any, { defaultValue: goal });
  };

  const getExperienceLevelLabel = (exp?: string | null) => {
    if (!exp) return t("member.personalInfo.notSpecified");
    return t(`member.experience.${exp}` as any, { defaultValue: exp });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Pending Invitation Banner if any */}
      <PendingInvitationBanner />

      {/* Header */}
      <ProfileHeader
        name={member.name}
        image={effectiveAvatar}
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
            {t("header.actions.editProfile")}
          </button>
        }
      >
        {latestMeasurement && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {t("member.headerStats.currentWeight")}
              </span>
              <span className="text-lg font-bold text-gray-100 font-mono mt-0.5">
                {latestMeasurement.weight !== null
                  ? `${latestMeasurement.weight} ${t("member.overview.kg")}`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {t("member.headerStats.bodyFat")}
              </span>
              <span className="text-lg font-bold text-gray-100 font-mono mt-0.5">
                {latestMeasurement.bodyFat !== null
                  ? `${latestMeasurement.bodyFat}%`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {t("member.headerStats.standingHeight")}
              </span>
              <span className="text-lg font-bold text-gray-100 font-mono mt-0.5">
                {latestMeasurement.height !== null
                  ? `${latestMeasurement.height} ${t("member.overview.cm")}`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {t("member.headerStats.activeRoutine")}
              </span>
              <span className="text-sm font-semibold text-gray-200 truncate mt-1">
                {currentAssignment?.workout?.title || t("member.headerStats.noActiveProgram")}
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
            title={t("member.personalInfo.title")}
            subtitle={t("member.personalInfo.subtitle")}
            icon={User}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {t("member.personalInfo.fullName")}
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {member.name}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {t("member.personalInfo.email")}
                </span>
                <span className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-gray-500" />
                  {member.email}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {t("member.personalInfo.phone")}
                </span>
                <span className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-gray-500" />
                  {(member as any).phone || t("member.personalInfo.notSpecified")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {t("member.personalInfo.accountStatus")}
                </span>
                <span className="text-sm font-medium text-emerald-400">
                  {member.isActive
                    ? t("header.verifiedActiveMember")
                    : t("header.inactive")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Target className="w-3 h-3 text-[#5BE584]" />
                  {t("member.personalInfo.fitnessGoal")}
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {getFitnessGoalLabel((member as any).fitnessGoal)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-[#5BE584]" />
                  {t("member.personalInfo.experienceLevel")}
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {getExperienceLevelLabel((member as any).experienceLevel)}
                </span>
              </div>
              {(member as any).bio && (
                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {t("member.personalInfo.bio")}
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
          <ProfileSection title={t("member.security.title")} icon={Shield}>
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-md bg-[#13171d] border border-[#1e2329]">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-[#5BE584]" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-200">
                      {t("member.security.passwordAuth")}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {(member as any).hasPassword === false
                        ? t("member.security.googleConnected")
                        : t("member.security.securedViaBcrypt")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="rounded border border-[#1e2329] bg-[#161b22] px-2.5 py-1 text-xs font-semibold text-[#5BE584] hover:bg-[#1e2329] hover:text-white transition-colors cursor-pointer"
                >
                  {(member as any).hasPassword === false
                    ? t("member.security.setPassword")
                    : t("member.security.changePassword")}
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

export default MemberProfileView;
