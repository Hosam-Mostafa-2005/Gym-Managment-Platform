// src/features/coach-dashboard/components/overview/OverviewCards.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { OverviewCard } from "./OverviewCard";
import { Users, Mail, Dumbbell, Clock } from "lucide-react";
import type { DashboardOverview } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface OverviewCardsProps {
  overview: DashboardOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const { t } = useTranslation(["coachDashboard"]);

  const activeCoaching =
    overview.activeCoachingMembers ?? overview.members?.active ?? 0;
  const pendingInvitations = overview.pendingInvitations ?? 0;
  const sessionsThisWeek = overview.completedSessionsThisWeek ?? 0;
  const sessionsToday = overview.completedSessionsToday ?? 0;
  const expiringAssignments = overview.expiringAssignments ?? 0;
  const activeAssignments = overview.assignments?.active ?? 0;

  return (
    <section
      className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Coach Dashboard Key Performance Indicators"
    >
      {/* 1. Active Coached Members */}
      <OverviewCard
        title={t("overviewCards.activeCoachedMembers")}
        value={activeCoaching}
        secondaryValue={overview.members?.total}
        secondaryLabel={t("overviewCards.totalRoster")}
        icon={Users}
        infoTooltip={{
          title: t("overviewCards.tooltips.activeMembersTitle"),
          description: t("overviewCards.tooltips.activeMembersDesc"),
          calculation: t("overviewCards.tooltips.activeMembersCalc"),
          unit: t("overviewCards.tooltips.activeMembersUnit"),
          dateRange: t("overviewCards.tooltips.activeMembersRange"),
          limitations: t("overviewCards.tooltips.activeMembersLimit"),
        }}
      />

      {/* 2. Pending Invitations */}
      <OverviewCard
        title={t("overviewCards.pendingInvitations")}
        value={pendingInvitations}
        secondaryValue={t("overviewCards.sent")}
        secondaryLabel=""
        icon={Mail}
        infoTooltip={{
          title: t("overviewCards.tooltips.pendingInvitesTitle"),
          description: t("overviewCards.tooltips.pendingInvitesDesc"),
          calculation: t("overviewCards.tooltips.pendingInvitesCalc"),
          unit: t("overviewCards.tooltips.pendingInvitesUnit"),
          dateRange: t("overviewCards.tooltips.pendingInvitesRange"),
          limitations: t("overviewCards.tooltips.pendingInvitesLimit"),
        }}
      />

      {/* 3. Sessions Completed This Week */}
      <OverviewCard
        title={t("overviewCards.sessionsThisWeek")}
        value={sessionsThisWeek}
        secondaryValue={sessionsToday}
        secondaryLabel={t("overviewCards.today")}
        icon={Dumbbell}
        infoTooltip={{
          title: t("overviewCards.tooltips.sessionsWeekTitle"),
          description: t("overviewCards.tooltips.sessionsWeekDesc"),
          calculation: t("overviewCards.tooltips.sessionsWeekCalc"),
          unit: t("overviewCards.tooltips.sessionsWeekUnit"),
          dateRange: t("overviewCards.tooltips.sessionsWeekRange"),
          limitations: t("overviewCards.tooltips.sessionsWeekLimit"),
        }}
      />

      {/* 4. Expiring Assignments */}
      <OverviewCard
        title={t("overviewCards.expiringAssignments")}
        value={expiringAssignments}
        secondaryValue={activeAssignments}
        secondaryLabel={t("overviewCards.totalActive")}
        icon={Clock}
        infoTooltip={{
          title: t("overviewCards.tooltips.expiringTitle"),
          description: t("overviewCards.tooltips.expiringDesc"),
          calculation: t("overviewCards.tooltips.expiringCalc"),
          unit: t("overviewCards.tooltips.expiringUnit"),
          dateRange: t("overviewCards.tooltips.expiringRange"),
          limitations: t("overviewCards.tooltips.expiringLimit"),
        }}
      />
    </section>
  );
};
