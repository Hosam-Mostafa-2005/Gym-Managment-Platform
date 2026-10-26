// src/services/coach-dashboard.service.ts
import prisma from "../config/prisma.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";
import AppError from "../utils/AppError.js";
import { mapCoachDashboard } from "../mappers/coach-dashboard.mapper.js";
import { PRIORITY, type Priority } from "../constants/dashboard.js";
import type {
  DashboardActivity,
  MemberAttention,
  UpcomingAssignment,
  DashboardPriority,
  QuickActions,
  ClientHealthItem,
  ActionCenterData,
} from "../types/coach-dashboard.types.js";

// ============================================================================
// CONSTANTS
// ============================================================================
const COMPLETION_WEIGHT = 0.6;
const COVERAGE_WEIGHT = 0.4;

const DAYS_INACTIVE = 7;
const DAYS_CRITICAL_INACTIVITY = 14;
const DAYS_MEASUREMENT_OVERDUE = 30;

const DAYS_UPCOMING_ASSIGNMENT = 2;

const CHART_DAYS_LONG = 30;
const CHART_DAYS_SHORT = 7;

const MAX_RECENT_ACTIVITY = 50;
const MAX_ATTENTION_MEMBERS = 5;
const MAX_UPCOMING_ASSIGNMENTS = 5;
const MAX_RECENT_MEASUREMENTS = 5;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const ACTIVITY_TYPE = {
  WORKOUT: "WORKOUT",
  ASSIGNMENT: "ASSIGNMENT",
  BODY_MEASUREMENT: "BODY_MEASUREMENT",
} as const;

const ACTIVITY_ACTION = {
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  CREATED: "CREATED",
  RECORDED: "RECORDED",
} as const;

// ============================================================================
// HELPERS
// ============================================================================
const getPastDates = (now: Date, days: number) => {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push({
      dateStr: d.toISOString().split("T")[0],
    });
  }
  return result;
};

// ============================================================================
// SERVICE
// ============================================================================
class CoachDashboardService {
  async getDashboard(userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const isAdmin = role === Roles.ADMIN;
    const now = new Date();

    let activeRelationships: any[] = [];
    let pendingInvitationsCount = 0;
    let coachedMemberIds: string[] = [];

    if (!isAdmin) {
      activeRelationships = await prisma.coachMemberRelationship
        .findMany({
          where: {
            trainerId: userId,
            status: RELATIONSHIP_STATUS.ACTIVE,
            isActive: true,
          },
          include: {
            member: { select: { id: true, name: true, email: true } },
          },
        })
        .catch(() => []);

      coachedMemberIds = activeRelationships.map((r) => r.memberId);

      pendingInvitationsCount = await prisma.coachMemberRelationship
        .count({
          where: {
            trainerId: userId,
            status: RELATIONSHIP_STATUS.PENDING,
            isActive: true,
          },
        })
        .catch(() => 0);
    }

    let assignedMemberIds: string[] = [];
    if (!isAdmin) {
      assignedMemberIds = await this.getTrainerMemberIds(userId);
    }

    // Unified managed member IDs (union of active coached members and assigned members)
    const memberIds = isAdmin
      ? []
      : Array.from(new Set([...coachedMemberIds, ...assignedMemberIds]));

    // Members who granted history sharing consent to this coach
    const grantedMemberIds = activeRelationships
      .filter((r) => r.historySharingConsent === HISTORY_SHARING_CONSENT.GRANTED)
      .map((r) => r.memberId);

    // Hardened privacy query filter for body measurements
    const authorizedMeasurementWhere: any = isAdmin
      ? { isActive: true }
      : {
          isActive: true,
          OR: [
            { trainerId: userId },
            ...(grantedMemberIds.length > 0
              ? [{ memberId: { in: grantedMemberIds } }]
              : []),
          ],
        };

    const [
      overview,
      charts,
      recentActivity,
      membersNeedingAttention,
      upcomingAssignments,
      recentMeasurements,
      upcomingScheduledWorkouts,
    ] = await Promise.all([
      this.getOverview(
        userId,
        isAdmin,
        memberIds,
        now,
        coachedMemberIds.length,
        pendingInvitationsCount,
        authorizedMeasurementWhere,
      ),
      this.getCharts(userId, isAdmin, memberIds, now, authorizedMeasurementWhere),
      this.getRecentActivity(
        userId,
        isAdmin,
        memberIds,
        MAX_RECENT_ACTIVITY,
        authorizedMeasurementWhere,
      ),
      this.getMembersNeedingAttention(
        isAdmin,
        memberIds,
        now,
        MAX_ATTENTION_MEMBERS,
        grantedMemberIds,
        userId,
      ),
      this.getUpcomingAssignments(userId, isAdmin, now, MAX_UPCOMING_ASSIGNMENTS),
      this.getRecentMeasurements(
        userId,
        isAdmin,
        grantedMemberIds,
        MAX_RECENT_MEASUREMENTS,
      ),
      this.getUpcomingScheduledWorkouts(isAdmin, memberIds, now, 5),
    ]);

    const clientHealthOverview = await this.getClientHealthOverview(
      userId,
      isAdmin,
      memberIds,
      activeRelationships,
      grantedMemberIds,
      now,
    );

    const actionCenter = await this.getActionCenter(
      userId,
      isAdmin,
      now,
      clientHealthOverview,
      upcomingAssignments,
    );

    const todaysPriorities = this.buildTodaysPriorities(
      membersNeedingAttention,
      upcomingAssignments,
    );

    const quickActions = this.buildQuickActions(
      membersNeedingAttention,
      upcomingAssignments,
    );

    return mapCoachDashboard({
      overview,
      todaysPriorities,
      charts,
      recentActivity,
      membersNeedingAttention,
      upcomingAssignments,
      upcomingScheduledWorkouts,
      recentMeasurements,
      quickActions,
      clientHealthOverview,
      actionCenter,
    });
  }

  // ==========================================================================
  // PRIVATE DATA FETCHERS
  // ==========================================================================

  private async getTrainerMemberIds(trainerId: string): Promise<string[]> {
    const assignments = await prisma.assignment.findMany({
      where: {
        trainerId,
        isActive: true,
        status: ASSIGNMENT_STATUS.ACTIVE,
      },
      select: { memberId: true },
    });

    return Array.from(new Set(assignments.map((a) => a.memberId)));
  }

  private async getOverview(
    userId: string,
    isAdmin: boolean,
    memberIds: string[],
    now: Date,
    activeCoachingCount: number,
    pendingInvitationsCount: number,
    authorizedMeasurementWhere: any,
  ) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - CHART_DAYS_SHORT);
    weekAgo.setHours(0, 0, 0, 0);

    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const [
      totalMembers,
      totalAssignments,
      activeAssignments,
      workoutsCreated,
      sessions,
      measurementsThisWeek,
      overdueAssignments,
      expiringAssignmentsCount,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          isActive: true,
          role: Roles.MEMBER,
          ...(isAdmin ? {} : { id: { in: memberIds } }),
        },
      }),
      prisma.assignment.count({
        where: {
          isActive: true,
          ...(isAdmin ? {} : { trainerId: userId }),
        },
      }),
      prisma.assignment.count({
        where: {
          isActive: true,
          status: ASSIGNMENT_STATUS.ACTIVE,
          ...(isAdmin ? {} : { trainerId: userId }),
        },
      }),
      prisma.workout.count({
        where: {
          isActive: true,
          ...(isAdmin ? {} : { createdBy: userId }),
        },
      }),
      prisma.workoutSession.findMany({
        where: {
          isActive: true,
          ...(isAdmin
            ? {}
            : { assignment: { trainerId: userId, isActive: true } }),
        },
        select: { startedAt: true, status: true },
      }),
      prisma.bodyMeasurement.count({
        where: {
          ...authorizedMeasurementWhere,
          measuredAt: { gte: weekAgo },
        },
      }).catch(() => 0),
      prisma.assignment.count({
        where: {
          isActive: true,
          status: ASSIGNMENT_STATUS.ACTIVE,
          endDate: { lt: now },
          ...(isAdmin ? {} : { trainerId: userId }),
        },
      }),
      prisma.assignment.count({
        where: {
          isActive: true,
          status: ASSIGNMENT_STATUS.ACTIVE,
          endDate: { gte: now, lte: in7Days },
          ...(isAdmin ? {} : { trainerId: userId }),
        },
      }).catch(() => 0),
    ]);

    const totalSessions = sessions.length;
    const completedTotal = sessions.filter(
      (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
    ).length;
    const completedToday = sessions.filter(
      (s) =>
        s.status === WORKOUT_SESSION_STATUS.COMPLETED &&
        s.startedAt &&
        s.startedAt >= today,
    ).length;
    const completedWeek = sessions.filter(
      (s) =>
        s.status === WORKOUT_SESSION_STATUS.COMPLETED &&
        s.startedAt &&
        s.startedAt >= weekAgo,
    ).length;

    const completionRate =
      totalSessions > 0
        ? Math.round((completedTotal / totalSessions) * 100)
        : 0;

    const coverageRatio =
      totalMembers > 0 ? activeAssignments / totalMembers : 0;

    const healthScore = Math.min(
      100,
      Math.round(
        completionRate * COMPLETION_WEIGHT +
          coverageRatio * 100 * COVERAGE_WEIGHT,
      ),
    );

    return {
      totalMembers,
      activeMembers: totalMembers,
      activeCoachingMembers: activeCoachingCount,
      pendingInvitations: pendingInvitationsCount,
      expiringAssignments: expiringAssignmentsCount,
      totalAssignments,
      activeAssignments,
      workoutsCreated,
      completedSessionsToday: completedToday,
      completedSessionsThisWeek: completedWeek,
      completedMemberSessions: completedTotal,
      overdueAssignments,
      completionRate,
      measurementsThisWeek,
      healthScore,
    };
  }

  private async getMembersNeedingAttention(
    isAdmin: boolean,
    memberIds: string[],
    now: Date,
    limit: number,
    grantedMemberIds: string[],
    userId: string,
  ): Promise<MemberAttention[]> {
    const candidateUsers = await prisma.user.findMany({
      where: {
        role: Roles.MEMBER,
        isActive: true,
        ...(isAdmin ? {} : { id: { in: memberIds } }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        workoutSessions: {
          where: { isActive: true },
          select: { startedAt: true, status: true },
          orderBy: { startedAt: "desc" },
        },
        measurementsAsMember: {
          where: { isActive: true },
          select: { measuredAt: true, trainerId: true },
          orderBy: { measuredAt: "desc" },
          take: 1,
        },
      },
    });

    const attentionList: MemberAttention[] = [];

    for (const u of candidateUsers) {
      const sessions = u.workoutSessions || [];
      const measurements = u.measurementsAsMember || [];
      const total = sessions.length;
      const completed = sessions.filter(
        (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
      ).length;
      const lastWorkout = sessions[0]?.startedAt || null;

      // Only inspect measurement if authorized
      const isAuthorized =
        isAdmin ||
        grantedMemberIds.includes(u.id) ||
        measurements[0]?.trainerId === userId;

      const latestMeasurement = isAuthorized
        ? measurements[0]?.measuredAt || null
        : null;

      const completionRate =
        total > 0 ? (completed / total) * 100 : 0;

      const daysSinceWorkout = lastWorkout
        ? (now.getTime() - new Date(lastWorkout).getTime()) / MS_PER_DAY
        : (now.getTime() - 0) / MS_PER_DAY;

      const daysSinceMeasurement = latestMeasurement
        ? (now.getTime() - new Date(latestMeasurement).getTime()) / MS_PER_DAY
        : 0;

      const reasons: string[] = [];
      if (daysSinceWorkout > DAYS_INACTIVE) {
        reasons.push(`No workout in over ${DAYS_INACTIVE} days`);
      }
      if (isAuthorized && latestMeasurement && daysSinceMeasurement > DAYS_MEASUREMENT_OVERDUE) {
        reasons.push(
          `No body measurement in ${DAYS_MEASUREMENT_OVERDUE}+ days`,
        );
      }
      if (total > 0 && completionRate < 40) {
        reasons.push("Completion rate below 40%");
      }

      if (reasons.length > 0) {
        attentionList.push({
          member: { _id: u.id, name: u.name, email: u.email },
          reasons,
          lastWorkout,
          completionRate: Math.round(completionRate),
          latestMeasurement,
          daysSinceWorkout,
          daysSinceMeasurement,
        });
      }
    }

    attentionList.sort(
      (a, b) =>
        b.daysSinceWorkout - a.daysSinceWorkout ||
        b.daysSinceMeasurement - a.daysSinceMeasurement,
    );

    return attentionList.slice(0, limit);
  }

  private async getUpcomingAssignments(
    userId: string,
    isAdmin: boolean,
    now: Date,
    limit: number,
  ): Promise<UpcomingAssignment[]> {
    const assignments = await prisma.assignment.findMany({
      where: {
        isActive: true,
        status: ASSIGNMENT_STATUS.ACTIVE,
        endDate: { gte: now },
        ...(isAdmin ? {} : { trainerId: userId }),
      },
      orderBy: { endDate: "asc" },
      take: limit,
      include: {
        member: { select: { id: true, name: true } },
        workout: { select: { id: true, title: true } },
      },
    });

    return assignments.map((a) => {
      const daysRemaining = a.endDate
        ? Math.max(
            0,
            Math.ceil(
              (new Date(a.endDate).getTime() - now.getTime()) / MS_PER_DAY,
            ),
          )
        : 0;
      return {
        id: a.id,
        member: a.member,
        workout: a.workout,
        endDate: a.endDate,
        daysRemaining,
      };
    });
  }

  private async getRecentMeasurements(
    userId: string,
    isAdmin: boolean,
    grantedMemberIds: string[],
    limit: number,
  ) {
    let where: any = { isActive: true };
    if (!isAdmin) {
      where = {
        isActive: true,
        OR: [
          { trainerId: userId },
          ...(grantedMemberIds.length > 0
            ? [{ memberId: { in: grantedMemberIds } }]
            : []),
        ],
      };
    }

    return await prisma.bodyMeasurement.findMany({
      where,
      orderBy: { measuredAt: "desc" },
      take: limit,
      include: {
        member: { select: { id: true, name: true, email: true } },
        trainer: { select: { id: true, name: true } },
      },
    });
  }

  private async getRecentActivity(
    userId: string,
    isAdmin: boolean,
    memberIds: string[],
    limit: number,
    authorizedMeasurementWhere: any,
  ): Promise<DashboardActivity[]> {
    const [sessions, assignments, measurements] = await Promise.all([
      prisma.workoutSession.findMany({
        where: {
          isActive: true,
          ...(isAdmin ? {} : { memberId: { in: memberIds } }),
        },
        orderBy: { startedAt: "desc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true } },
          assignment: {
            include: { workout: { select: { id: true, title: true } } },
          },
        },
      }),
      prisma.assignment.findMany({
        where: {
          isActive: true,
          ...(isAdmin ? {} : { trainerId: userId }),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true } },
          workout: { select: { id: true, title: true } },
        },
      }),
      prisma.bodyMeasurement.findMany({
        where: authorizedMeasurementWhere,
        orderBy: { measuredAt: "desc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true } },
        },
      }).catch(() => []),
    ]);

    const events: DashboardActivity[] = [];

    sessions.forEach((s) => {
      const title = s.assignment?.workout?.title || "Workout";
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED) {
        if (s.endedAt || s.startedAt) {
          events.push({
            type: ACTIVITY_TYPE.WORKOUT,
            member: s.member,
            date: s.endedAt || s.startedAt,
            action: ACTIVITY_ACTION.COMPLETED,
            metadata: {
              workoutTitle: title,
              duration: s.duration,
              volume: s.totalVolume,
            },
          });
        }
      } else if (s.startedAt) {
        events.push({
          type: ACTIVITY_TYPE.WORKOUT,
          member: s.member,
          date: s.startedAt,
          action: ACTIVITY_ACTION.STARTED,
          metadata: { workoutTitle: title },
        });
      }
    });

    assignments.forEach((a) => {
      events.push({
        type: ACTIVITY_TYPE.ASSIGNMENT,
        member: a.member,
        date: a.createdAt,
        action: ACTIVITY_ACTION.CREATED,
        metadata: {
          workoutTitle: a.workout?.title || "Custom Workout",
          endDate: a.endDate,
        },
      });
    });

    measurements.forEach((m) => {
      events.push({
        type: ACTIVITY_TYPE.BODY_MEASUREMENT,
        member: m.member,
        date: m.measuredAt,
        action: ACTIVITY_ACTION.RECORDED,
        metadata: { weight: m.weight, bodyFat: m.bodyFat },
      });
    });

    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  private async getCharts(
    userId: string,
    isAdmin: boolean,
    memberIds: string[],
    now: Date,
    authorizedMeasurementWhere: any,
  ) {
    const days30Ago = new Date(now);
    days30Ago.setDate(days30Ago.getDate() - CHART_DAYS_LONG);

    const [
      sessions,
      measurements,
      assignments,
      assignmentStatuses,
      memberSessionCounts,
    ] = await Promise.all([
      prisma.workoutSession.findMany({
        where: {
          isActive: true,
          startedAt: { gte: days30Ago },
          ...(isAdmin ? {} : { memberId: { in: memberIds } }),
        },
        select: { startedAt: true, status: true },
      }),
      prisma.bodyMeasurement.findMany({
        where: {
          ...authorizedMeasurementWhere,
          measuredAt: { gte: days30Ago },
        },
        select: { measuredAt: true },
      }).catch(() => []),
      prisma.assignment.findMany({
        where: {
          isActive: true,
          createdAt: { gte: days30Ago },
          ...(isAdmin ? {} : { trainerId: userId }),
        },
        select: { createdAt: true },
      }),
      prisma.assignment.groupBy({
        by: ["status"],
        where: {
          isActive: true,
          ...(isAdmin ? {} : { trainerId: userId }),
        },
        _count: { status: true },
      }).catch(() => []),
      prisma.workoutSession.groupBy({
        by: ["memberId"],
        where: {
          isActive: true,
          status: WORKOUT_SESSION_STATUS.COMPLETED,
          ...(isAdmin ? {} : { memberId: { in: memberIds } }),
        },
        _count: { memberId: true },
        orderBy: { _count: { memberId: "desc" } },
        take: 6,
      }).catch(() => []),
    ]);

    const sessionStatsByDate = new Map<
      string,
      { count: number; completed: number }
    >();
    sessions.forEach((s) => {
      if (!s.startedAt) return;
      const d = s.startedAt.toISOString().split("T")[0];
      const cur = sessionStatsByDate.get(d) || { count: 0, completed: 0 };
      cur.count += 1;
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED) {
        cur.completed += 1;
      }
      sessionStatsByDate.set(d, cur);
    });

    const measurementCountsByDate = new Map<string, number>();
    measurements.forEach((m) => {
      if (!m.measuredAt) return;
      const d = (m.measuredAt instanceof Date ? m.measuredAt : new Date(m.measuredAt))
        .toISOString()
        .split("T")[0];
      measurementCountsByDate.set(
        d,
        (measurementCountsByDate.get(d) || 0) + 1,
      );
    });

    const assignmentCountsByDate = new Map<string, number>();
    assignments.forEach((a) => {
      if (!a.createdAt) return;
      const d = (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt))
        .toISOString()
        .split("T")[0];
      assignmentCountsByDate.set(
        d,
        (assignmentCountsByDate.get(d) || 0) + 1,
      );
    });

    const labels30 = getPastDates(now, CHART_DAYS_LONG);

    const sessions7 = getPastDates(now, CHART_DAYS_SHORT).map((l) => ({
      date: l.dateStr,
      value: sessionStatsByDate.get(l.dateStr)?.count || 0,
    }));
    const sessions30 = labels30.map((l) => ({
      date: l.dateStr,
      value: sessionStatsByDate.get(l.dateStr)?.count || 0,
    }));
    const measurements30 = labels30.map((l) => ({
      date: l.dateStr,
      value: measurementCountsByDate.get(l.dateStr) || 0,
    }));
    const assignments30 = labels30.map((l) => ({
      date: l.dateStr,
      value: assignmentCountsByDate.get(l.dateStr) || 0,
    }));

    const completionRate30 = labels30.map((l) => {
      const data = sessionStatsByDate.get(l.dateStr);
      const val =
        data && data.count > 0
          ? Math.round((data.completed / data.count) * 100)
          : 0;
      return { date: l.dateStr, value: val };
    });

    // Donut chart: Assignment Status Distribution
    const statusMap = new Map(
      (assignmentStatuses || []).map((s: any) => [s.status, s._count.status]),
    );
    const activeCount = statusMap.get(ASSIGNMENT_STATUS.ACTIVE) || 0;
    const completedCount = statusMap.get(ASSIGNMENT_STATUS.COMPLETED) || 0;
    const cancelledCount = statusMap.get(ASSIGNMENT_STATUS.CANCELLED) || 0;
    const totalStatusCount = activeCount + completedCount + cancelledCount;

    const assignmentStatusDistribution = [
      {
        status: "Active",
        count: activeCount,
        percentage:
          totalStatusCount > 0
            ? Math.round((activeCount / totalStatusCount) * 100)
            : 0,
        color: "#5BE584",
      },
      {
        status: "Completed",
        count: completedCount,
        percentage:
          totalStatusCount > 0
            ? Math.round((completedCount / totalStatusCount) * 100)
            : 0,
        color: "#3B82F6",
      },
      {
        status: "Cancelled",
        count: cancelledCount,
        percentage:
          totalStatusCount > 0
            ? Math.round((cancelledCount / totalStatusCount) * 100)
            : 0,
        color: "#EF4444",
      },
    ];

    // Horizontal Bar: Member Activity Ranking
    const rankingMemberIds = (memberSessionCounts || []).map(
      (m: any) => m.memberId,
    );
    let memberActivityRanking: Array<{
      memberId: string;
      name: string;
      completedSessions: number;
    }> = [];
    if (rankingMemberIds.length > 0) {
      const users = await prisma.user
        .findMany({
          where: { id: { in: rankingMemberIds } },
          select: { id: true, name: true },
        })
        .catch(() => []);
      const userNameMap = new Map(
        (users || []).map((u: any) => [u.id, u.name]),
      );
      memberActivityRanking = (memberSessionCounts || []).map((m: any) => ({
        memberId: m.memberId,
        name: userNameMap.get(m.memberId) || "Member",
        completedSessions: m._count.memberId,
      }));
    }

    return {
      sessions: { last7Days: sessions7, last30Days: sessions30 },
      measurements: { last30Days: measurements30 },
      assignments: { last30Days: assignments30 },
      completionRateTrend: { last30Days: completionRate30 },
      assignmentStatusDistribution,
      memberActivityRanking,
    };
  }

  private async getClientHealthOverview(
    userId: string,
    isAdmin: boolean,
    memberIds: string[],
    activeRelationships: any[],
    grantedMemberIds: string[],
    now: Date,
  ): Promise<ClientHealthItem[]> {
    if (memberIds.length === 0 && !isAdmin) return [];

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clientUsers = await prisma.user
      .findMany({
        where: {
          isActive: true,
          role: Roles.MEMBER,
          ...(isAdmin ? {} : { id: { in: memberIds } }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          workoutSessions: {
            where: { isActive: true, status: WORKOUT_SESSION_STATUS.COMPLETED },
            select: { startedAt: true },
            orderBy: { startedAt: "desc" },
          },
        },
      })
      .catch(() => []);

    const relMap = new Map(activeRelationships.map((r) => [r.memberId, r]));

    const healthList: ClientHealthItem[] = [];

    for (const client of clientUsers) {
      const rel = relMap.get(client.id);
      const relationshipStatus = rel ? rel.status : "ASSIGNED";
      const historySharingConsent = rel ? rel.historySharingConsent : "NONE";

      const clientSessions = client.workoutSessions || [];
      const lastWorkout = clientSessions[0]?.startedAt || null;
      const daysSinceLastWorkout = lastWorkout
        ? Math.floor(
            (now.getTime() - new Date(lastWorkout).getTime()) / MS_PER_DAY,
          )
        : null;

      let activityStatus: "ACTIVE" | "INACTIVE_7_DAYS" | "NO_WORKOUTS" = "ACTIVE";
      if (!lastWorkout) {
        activityStatus = "NO_WORKOUTS";
      } else if (
        daysSinceLastWorkout !== null &&
        daysSinceLastWorkout > DAYS_INACTIVE
      ) {
        activityStatus = "INACTIVE_7_DAYS";
      }

      const completedSessionsThisMonth = clientSessions.filter(
        (s) => s.startedAt && new Date(s.startedAt) >= thirtyDaysAgo,
      ).length;

      // Determine measurement authorization
      const isAuthorized = isAdmin || grantedMemberIds.includes(client.id);

      let latestMeasurement = {
        weight: null as number | null,
        measuredAt: null as Date | null,
        isRestricted: false,
        restrictionReason: undefined as string | undefined,
      };

      if (isAuthorized) {
        const m = await prisma.bodyMeasurement
          .findFirst({
            where: { memberId: client.id, isActive: true },
            orderBy: { measuredAt: "desc" },
            select: { weight: true, measuredAt: true },
          })
          .catch(() => null);

        if (m) {
          latestMeasurement = {
            weight: m.weight,
            measuredAt: m.measuredAt,
            isRestricted: false,
            restrictionReason: undefined,
          };
        }
      } else {
        // Coach is NOT authorized for member's general measurements.
        // Check if coach recorded any measurement themselves for this member:
        const coachM = await prisma.bodyMeasurement
          .findFirst({
            where: { memberId: client.id, trainerId: userId, isActive: true },
            orderBy: { measuredAt: "desc" },
            select: { weight: true, measuredAt: true },
          })
          .catch(() => null);

        if (coachM) {
          latestMeasurement = {
            weight: coachM.weight,
            measuredAt: coachM.measuredAt,
            isRestricted: false,
            restrictionReason: undefined,
          };
        } else {
          // Explicit safe restriction state
          latestMeasurement = {
            weight: null,
            measuredAt: null,
            isRestricted: true,
            restrictionReason: rel
              ? "CONSENT_REQUIRED"
              : "NO_ACTIVE_RELATIONSHIP",
          };
        }
      }

      healthList.push({
        id: client.id,
        name: client.name,
        email: client.email,
        relationshipStatus,
        historySharingConsent,
        lastWorkoutDate: lastWorkout,
        daysSinceLastWorkout,
        activityStatus,
        completedSessionsThisMonth,
        latestMeasurement,
      });
    }

    return healthList;
  }

  private async getActionCenter(
    userId: string,
    isAdmin: boolean,
    now: Date,
    clientHealthList: ClientHealthItem[],
    upcomingAssignments: UpcomingAssignment[],
  ): Promise<ActionCenterData> {
    const pendingInvitations = isAdmin
      ? []
      : await prisma.coachMemberRelationship
          .findMany({
            where: {
              trainerId: userId,
              status: RELATIONSHIP_STATUS.PENDING,
              isActive: true,
            },
            include: {
              member: { select: { id: true, name: true, email: true } },
            },
            orderBy: { invitedAt: "desc" },
            take: 5,
          })
          .catch(() => []);

    const expiringAssignments = upcomingAssignments.filter(
      (a) => a.daysRemaining <= 7,
    );

    const inactiveClients = clientHealthList
      .filter((c) => c.activityStatus === "INACTIVE_7_DAYS")
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        daysSinceLastWorkout: c.daysSinceLastWorkout,
        lastWorkoutDate: c.lastWorkoutDate,
      }));

    return {
      pendingInvitations: pendingInvitations.map((p) => ({
        id: p.id,
        member: { id: p.member.id, name: p.member.name, email: p.member.email },
        invitedAt: p.invitedAt,
        notes: p.notes,
      })),
      expiringAssignments,
      inactiveClients,
    };
  }

  private async getUpcomingScheduledWorkouts(
    isAdmin: boolean,
    memberIds: string[],
    now: Date,
    limit: number,
  ) {
    if (!prisma.scheduledWorkout) return [];
    try {
      const schedules = await prisma.scheduledWorkout.findMany({
        where: {
          isActive: true,
          status: "SCHEDULED",
          scheduledAt: { gte: now },
          ...(isAdmin ? {} : { memberId: { in: memberIds } }),
        },
        orderBy: { scheduledAt: "asc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true, email: true } },
          workout: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
            },
          },
        },
      });
      return schedules;
    } catch {
      return [];
    }
  }

  // ==========================================================================
  // DATA SYNTHESIZERS
  // ==========================================================================

  private buildTodaysPriorities(
    membersNeedingAttention: MemberAttention[],
    upcomingAssignments: UpcomingAssignment[],
  ): DashboardPriority[] {
    const prioritiesMap = new Map<string, any>();

    // Process Members Needing Attention
    membersNeedingAttention.forEach((m) => {
      const id = (m.member._id || (m.member as any).id)?.toString();
      let priority: Priority = PRIORITY.LOW;

      const hasLongInactivity = m.daysSinceWorkout > DAYS_INACTIVE;
      const hasExtremeInactivity =
        m.daysSinceWorkout > DAYS_CRITICAL_INACTIVITY;

      if (hasExtremeInactivity) priority = PRIORITY.CRITICAL;
      else if (hasLongInactivity) priority = PRIORITY.HIGH;
      else priority = PRIORITY.MEDIUM;

      prioritiesMap.set(id, {
        member: m.member,
        priority,
        reasons: [...m.reasons],
      });
    });

    // Process Upcoming Assignments
    upcomingAssignments.forEach((a) => {
      if (a.daysRemaining <= DAYS_UPCOMING_ASSIGNMENT) {
        const id = ((a.member as any)._id || (a.member as any).id)?.toString();
        const reason = `Assignment "${a.workout?.title}" ends in ${a.daysRemaining} days`;

        if (prioritiesMap.has(id)) {
          const current = prioritiesMap.get(id);
          current.reasons.push(reason);
          if (current.priority === PRIORITY.LOW) {
            current.priority = PRIORITY.MEDIUM;
          }
        } else {
          prioritiesMap.set(id, {
            member: a.member,
            priority: PRIORITY.MEDIUM,
            reasons: [reason],
          });
        }
      }
    });

    return Array.from(prioritiesMap.values()).map((p) => {
      let title = "Member Needs Attention";
      let description = p.reasons[0];

      if (p.reasons.some((r: string) => r.includes("workout"))) {
        title = "Workout Follow-up";
        description =
          "This member has been inactive and should be followed up.";
      } else if (p.reasons.some((r: string) => r.includes("Completion"))) {
        title = "Low Workout Completion";
        description = "This member has a low workout completion rate.";
      } else if (p.reasons.some((r: string) => r.includes("measurement"))) {
        title = "Measurement Review";
        description = "This member needs a new body measurement.";
      } else if (p.reasons.some((r: string) => r.includes("Assignment"))) {
        title = "Assignment Ending Soon";
        description = "A workout assignment is about to expire.";
      }

      return {
        type: "MEMBER_ACTION" as const,
        priority: p.priority,
        title,
        description,
        member: p.member,
        reasons: p.reasons,
        count: p.reasons.length,
      };
    });
  }

  private buildQuickActions(
    membersNeedingAttention: MemberAttention[],
    upcomingAssignments: UpcomingAssignment[],
  ): QuickActions {
    const inactiveMembers = membersNeedingAttention.filter(
      (m) => m.daysSinceWorkout > DAYS_INACTIVE,
    ).length;

    const overdueMeasurements = membersNeedingAttention.filter(
      (m) => m.daysSinceMeasurement > DAYS_MEASUREMENT_OVERDUE,
    ).length;

    const assignmentsEndingSoon = upcomingAssignments.filter(
      (a) => a.daysRemaining <= DAYS_UPCOMING_ASSIGNMENT,
    ).length;

    return {
      inactiveMembers,
      overdueMeasurements,
      assignmentsEndingSoon,
    };
  }
}

export default new CoachDashboardService();
