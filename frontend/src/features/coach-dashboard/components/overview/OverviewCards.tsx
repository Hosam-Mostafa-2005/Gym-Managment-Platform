// src/features/coach-dashboard/components/overview/OverviewCards.tsx
import React from "react";
import { OverviewCard } from "./OverviewCard";
import { Users, Mail, Dumbbell, Clock } from "lucide-react";
import type { DashboardOverview } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface OverviewCardsProps {
  overview: DashboardOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
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
        title="Active Coached Members"
        value={activeCoaching}
        secondaryValue={overview.members?.total}
        secondaryLabel="total roster"
        icon={Users}
        infoTooltip={{
          title: "Active Coached Members",
          description:
            "Number of members connected to you with an active coaching relationship.",
          calculation:
            "COUNT(CoachMemberRelationship WHERE trainerId = coach.id AND status = 'ACTIVE')",
          unit: "athletes",
          dateRange: "Current active roster",
          limitations:
            "Excludes pending invitations, terminated relationships, or unassigned members.",
        }}
      />

      {/* 2. Pending Invitations */}
      <OverviewCard
        title="Pending Invitations"
        value={pendingInvitations}
        secondaryValue="sent"
        secondaryLabel=""
        icon={Mail}
        infoTooltip={{
          title: "Pending Coaching Invitations",
          description:
            "Invitations sent to prospective members that have not yet been accepted or declined.",
          calculation:
            "COUNT(CoachMemberRelationship WHERE trainerId = coach.id AND status = 'PENDING')",
          unit: "invitations",
          dateRange: "Awaiting response",
          limitations: "Updated immediately when members accept or decline.",
        }}
      />

      {/* 3. Sessions Completed This Week */}
      <OverviewCard
        title="Sessions Completed This Week"
        value={sessionsThisWeek}
        secondaryValue={sessionsToday}
        secondaryLabel="today"
        icon={Dumbbell}
        infoTooltip={{
          title: "Client Workout Sessions This Week",
          description:
            "Total verified workout sessions completed by your coached and assigned members over the last 7 days.",
          calculation:
            "COUNT(WorkoutSession WHERE status = 'COMPLETED' AND startedAt >= weekAgo AND memberId IN roster)",
          unit: "sessions",
          dateRange: "Past 7 days",
          limitations: "Only counts completed sessions.",
        }}
      />

      {/* 4. Expiring Assignments */}
      <OverviewCard
        title="Expiring Assignments"
        value={expiringAssignments}
        secondaryValue={activeAssignments}
        secondaryLabel="total active"
        icon={Clock}
        infoTooltip={{
          title: "Assignments Ending Soon",
          description:
            "Workout program assignments scheduled to conclude within the next 7 days.",
          calculation:
            "COUNT(Assignment WHERE trainerId = coach.id AND status = 'ACTIVE' AND endDate <= now + 7d)",
          unit: "assignments",
          dateRange: "Next 7 days",
          limitations: "Allows proactive review and program renewal.",
        }}
      />
    </section>
  );
};
