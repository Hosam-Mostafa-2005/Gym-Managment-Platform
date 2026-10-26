// src/mappers/coach-dashboard.mapper.ts
import type { CoachDashboardMapperInput } from "../types/coach-dashboard.types.js";

export const mapCoachDashboard = ({
  overview,
  todaysPriorities,
  charts,
  recentActivity,
  membersNeedingAttention,
  upcomingAssignments,
  upcomingScheduledWorkouts = [],
  recentMeasurements,
  quickActions,
  clientHealthOverview = [],
  actionCenter = {
    pendingInvitations: [],
    expiringAssignments: [],
    inactiveClients: [],
  },
}: CoachDashboardMapperInput) => {
  return {
    generatedAt: new Date(),
    overview: {
      members: {
        active: overview.activeMembers,
        total: overview.totalMembers,
      },
      assignments: {
        active: overview.activeAssignments,
        total: overview.totalAssignments,
      },
      activeCoachingMembers: overview.activeCoachingMembers ?? overview.activeMembers,
      pendingInvitations: overview.pendingInvitations ?? 0,
      expiringAssignments: overview.expiringAssignments ?? 0,
      workoutsCreated: overview.workoutsCreated,
      completedSessionsToday: overview.completedSessionsToday,
      completedSessionsThisWeek: overview.completedSessionsThisWeek,
      completedMemberSessions:
        overview.completedMemberSessions ?? overview.completedSessionsThisWeek,
      overdueAssignments: overview.overdueAssignments ?? 0,
      completionRate: overview.completionRate,
      measurementsThisWeek: overview.measurementsThisWeek,
      healthScore: overview.healthScore,
    },
    todaysPriorities,
    charts: {
      sessions: {
        last7Days: charts.sessions.last7Days || [],
        last30Days: charts.sessions.last30Days || [],
      },
      measurements: {
        last30Days: charts.measurements.last30Days || [],
      },
      assignments: {
        last30Days: charts.assignments.last30Days || [],
      },
      completionRate: {
        last30Days: charts.completionRateTrend.last30Days || [],
      },
      assignmentStatusDistribution: charts.assignmentStatusDistribution || [],
      memberActivityRanking: charts.memberActivityRanking || [],
    },
    upcomingScheduledWorkouts: (upcomingScheduledWorkouts || []).map((s: any) => ({
      id: s.id,
      member: s.member
        ? {
            id: s.member.id || s.member._id,
            name: s.member.name,
            email: s.member.email,
          }
        : null,
      workout: s.workout
        ? {
            id: s.workout.id || s.workout._id,
            title: s.workout.title,
            category: s.workout.category,
            difficulty: s.workout.difficulty,
          }
        : null,
      scheduledAt: s.scheduledAt,
      notes: s.notes,
    })),
    recentActivity: recentActivity.map((event: any) => ({
      type: event.type,
      member: event.member
        ? {
            id: event.member._id?.toString() || event.member.id,
            name: event.member.name,
          }
        : null,
      date: event.date,
      action: event.action,
      metadata: event.metadata || {},
    })),
    membersNeedingAttention: membersNeedingAttention.map((m: any) => ({
      member: {
        id: m.member._id?.toString() || m.member.id,
        name: m.member.name,
        email: m.member.email,
      },
      reasons: m.reasons,
      lastWorkout: m.lastWorkout,
      completionRate: m.completionRate,
      latestMeasurement: m.latestMeasurement,
    })),
    upcomingAssignments: upcomingAssignments.map((a: any) => ({
      id: a.id,
      member: a.member
        ? {
            id: a.member._id?.toString() || a.member.id,
            name: a.member.name,
          }
        : null,
      workout: a.workout
        ? {
            id: a.workout._id?.toString() || a.workout.id,
            title: a.workout.title,
          }
        : null,
      endDate: a.endDate,
      daysRemaining: a.daysRemaining,
    })),
    recentMeasurements: recentMeasurements.map((m: any) => ({
      id: m.id,
      member: m.member
        ? {
            id: m.member._id?.toString() || m.member.id,
            name: m.member.name,
          }
        : null,
      trainer: m.trainer
        ? {
            id: m.trainer._id?.toString() || m.trainer.id,
            name: m.trainer.name,
          }
        : null,
      weight: m.weight,
      bodyFat: m.bodyFat,
      measuredAt: m.measuredAt,
      isRestricted: m.isRestricted ?? false,
    })),
    clientHealthOverview: clientHealthOverview.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      relationshipStatus: item.relationshipStatus,
      historySharingConsent: item.historySharingConsent,
      lastWorkoutDate: item.lastWorkoutDate,
      daysSinceLastWorkout: item.daysSinceLastWorkout,
      activityStatus: item.activityStatus,
      completedSessionsThisMonth: item.completedSessionsThisMonth,
      latestMeasurement: item.latestMeasurement,
    })),
    actionCenter,
    quickActions,
    ai: {
      enabled: false,
      summary: null,
    },
  };
};

export default mapCoachDashboard;
