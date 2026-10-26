// src/services/coach-profile.service.ts
import prisma from "../config/prisma.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import AppError from "../utils/AppError.js";
import { mapCoachProfile } from "../mappers/coach-profile.mapper.js";
import type { UpdateCoachProfileDto } from "../types/coach-profile.types.js";
import type { DashboardActivity } from "../types/coach-dashboard.types.js";

const CHART_DAYS_LONG = 30;
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

class CoachProfileService {
  async getProfile(userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const now = new Date();

    const coach = await prisma.user.findFirst({
      where: { id: userId, isActive: true },
    });
    if (!coach) {
      throw new AppError("Coach not found.", 404);
    }

    const [
      overview,
      memberStats,
      workoutStats,
      charts,
      recentActivity,
      upcomingTasks,
    ] = await Promise.all([
      this.getOverview(userId, now),
      this.getMemberStats(userId, now),
      this.getWorkoutStats(userId),
      this.getPerformanceCharts(userId, now),
      this.getRecentActivity(userId, 10),
      this.getUpcomingTasks(userId, now, 5),
    ]);

    const achievements = this.calculateAchievements({
      totalMembers: memberStats.active + memberStats.inactive,
      completedSessions: overview.completedSessions,
      workoutsCreated: workoutStats.totalCreated,
      joinedAt: coach.createdAt,
      now,
    });

    return mapCoachProfile({
      coach,
      overview,
      memberStats,
      workoutStats,
      charts,
      recentActivity,
      achievements,
      upcomingTasks,
    });
  }

  async updateProfile(userId: string, role: Role, data: UpdateCoachProfileDto) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const coach = await prisma.user.findFirst({
      where: { id: userId, isActive: true },
    });
    if (!coach) {
      throw new AppError("Coach not found.", 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.specialties !== undefined && { specialties: data.specialties }),
        ...(data.certifications !== undefined && { certifications: data.certifications }),
        ...(data.yearsOfExperience !== undefined && { yearsOfExperience: data.yearsOfExperience }),
        ...(data.professionalTitle !== undefined && { professionalTitle: data.professionalTitle }),
        ...(data.coachingPhilosophy !== undefined && { coachingPhilosophy: data.coachingPhilosophy }),
        ...(data.languagesSpoken !== undefined && { languagesSpoken: data.languagesSpoken }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      bio: updated.bio,
      specialties: updated.specialties,
      certifications: updated.certifications,
      yearsOfExperience: updated.yearsOfExperience,
      professionalTitle: updated.professionalTitle,
      coachingPhilosophy: updated.coachingPhilosophy,
      languagesSpoken: updated.languagesSpoken,
      joinedAt: updated.createdAt,
    };
  }

  private async getOverview(userId: string, now: Date) {
    const [
      assignmentsAssigned,
      workoutsCreated,
      sessions,
      measurementsReviewed,
      activeAssignments,
      assignmentsMembers,
    ] = await Promise.all([
      prisma.assignment.count({
        where: { trainerId: userId, isActive: true },
      }),
      prisma.workout.count({
        where: { createdBy: userId, isActive: true },
      }),
      prisma.workoutSession.findMany({
        where: {
          assignment: { trainerId: userId, isActive: true },
          isActive: true,
        },
        select: { status: true },
      }),
      prisma.bodyMeasurement.count({
        where: { trainerId: userId, isActive: true },
      }),
      prisma.assignment.count({
        where: {
          trainerId: userId,
          isActive: true,
          status: ASSIGNMENT_STATUS.ACTIVE,
        },
      }),
      prisma.assignment.findMany({
        where: { trainerId: userId, isActive: true },
        select: { memberId: true },
      }),
    ]);

    const completedSessions = sessions.filter(
      (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
    ).length;
    const totalSessions = sessions.length;

    const activeMembers = new Set(assignmentsMembers.map((a) => a.memberId)).size;
    const completionRate =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

    return {
      activeMembers,
      activeAssignments,
      workoutsCreated,
      completedSessions,
      completionRate,
      measurementsReviewed,
    };
  }

  private async getMemberStats(userId: string, now: Date) {
    const [assignments, activeAssignmentsCount, completedProgramsCount] =
      await Promise.all([
        prisma.assignment.findMany({
          where: { trainerId: userId, isActive: true },
          include: { member: true },
        }),
        prisma.assignment.count({
          where: {
            trainerId: userId,
            isActive: true,
            status: ASSIGNMENT_STATUS.ACTIVE,
          },
        }),
        prisma.assignment.count({
          where: {
            trainerId: userId,
            isActive: true,
            status: ASSIGNMENT_STATUS.COMPLETED,
          },
        }),
      ]);

    const memberMap = new Map<string, any>();
    assignments.forEach((a) => {
      if (a.member) {
        memberMap.set(a.member.id, a.member);
      }
    });

    const members = Array.from(memberMap.values());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newThisMonth = members.filter(
      (m: any) => new Date(m.createdAt) >= startOfMonth,
    ).length;

    const active = activeAssignmentsCount;
    const inactive = Math.max(0, members.length - active);

    return {
      active,
      inactive,
      newThisMonth,
      completedPrograms: completedProgramsCount,
    };
  }

  private async getWorkoutStats(userId: string) {
    const [totalCreated, published, mostAssignedAgg] = await Promise.all([
      prisma.workout.count({
        where: { createdBy: userId, isActive: true },
      }),
      prisma.workout.count({
        where: {
          createdBy: userId,
          isActive: true,
          isTemplate: false,
        },
      }),
      prisma.assignment.groupBy({
        by: ["workoutId"],
        where: { trainerId: userId, isActive: true },
        _count: { workoutId: true },
        orderBy: { _count: { workoutId: "desc" } },
        take: 1,
      }),
    ]);

    let mostAssignedWorkout: { id: string; title: string; count: number } | null =
      null;

    if (mostAssignedAgg.length > 0) {
      const topWorkout = await prisma.workout.findUnique({
        where: { id: mostAssignedAgg[0].workoutId },
        select: { id: true, title: true },
      });
      if (topWorkout) {
        mostAssignedWorkout = {
          id: topWorkout.id,
          title: topWorkout.title,
          count: mostAssignedAgg[0]._count.workoutId,
        };
      }
    }

    return {
      totalCreated,
      published,
      mostAssignedWorkout,
    };
  }

  private async getPerformanceCharts(userId: string, now: Date) {
    const days30Ago = new Date(now);
    days30Ago.setDate(days30Ago.getDate() - CHART_DAYS_LONG);

    const [sessions, assignments] = await Promise.all([
      prisma.workoutSession.findMany({
        where: {
          assignment: { trainerId: userId, isActive: true },
          startedAt: { gte: days30Ago },
          isActive: true,
        },
        select: { startedAt: true, status: true },
      }),
      prisma.assignment.findMany({
        where: {
          trainerId: userId,
          isActive: true,
          createdAt: { gte: days30Ago },
        },
        select: { createdAt: true },
      }),
    ]);

    const sessionCountsByDate = new Map<string, { count: number; completed: number }>();
    sessions.forEach((s) => {
      if (!s.startedAt) return;
      const d = s.startedAt.toISOString().split("T")[0];
      const current = sessionCountsByDate.get(d) || { count: 0, completed: 0 };
      current.count += 1;
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED) {
        current.completed += 1;
      }
      sessionCountsByDate.set(d, current);
    });

    const assignmentCountsByDate = new Map<string, number>();
    assignments.forEach((a) => {
      const d = a.createdAt.toISOString().split("T")[0];
      assignmentCountsByDate.set(d, (assignmentCountsByDate.get(d) || 0) + 1);
    });

    const labels30 = getPastDates(now, CHART_DAYS_LONG);

    const sessionsLast30Days = labels30.map((l) => ({
      date: l.dateStr,
      value: sessionCountsByDate.get(l.dateStr)?.count || 0,
    }));

    const membersGrowth = labels30.map((l) => ({
      date: l.dateStr,
      value: assignmentCountsByDate.get(l.dateStr) || 0,
    }));

    const completionRateTrend = labels30.map((l) => {
      const data = sessionCountsByDate.get(l.dateStr);
      const val =
        data && data.count > 0
          ? Math.round((data.completed / data.count) * 100)
          : 0;
      return { date: l.dateStr, value: val };
    });

    return {
      sessionsLast30Days,
      membersGrowth,
      completionRateTrend,
    };
  }

  private async getRecentActivity(userId: string, limit: number) {
    const [sessions, assignments, measurements] = await Promise.all([
      prisma.workoutSession.findMany({
        where: {
          assignment: { trainerId: userId, isActive: true },
          isActive: true,
        },
        orderBy: { startedAt: "desc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true } },
          assignment: {
            include: {
              workout: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.assignment.findMany({
        where: { trainerId: userId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true } },
          workout: { select: { id: true, title: true } },
        },
      }),
      prisma.bodyMeasurement.findMany({
        where: { trainerId: userId, isActive: true },
        orderBy: { measuredAt: "desc" },
        take: limit,
        include: {
          member: { select: { id: true, name: true } },
        },
      }),
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
        metadata: { workoutTitle: a.workout?.title || "Workout" },
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

  private async getUpcomingTasks(userId: string, now: Date, limit: number) {
    const assignments = await prisma.assignment.findMany({
      where: {
        trainerId: userId,
        isActive: true,
        status: ASSIGNMENT_STATUS.ACTIVE,
        endDate: { gte: now },
      },
      orderBy: { endDate: "asc" },
      take: limit,
      include: {
        member: { select: { id: true, name: true } },
        workout: { select: { id: true, title: true } },
      },
    });

    return assignments.map((a) => {
      const daysRemaining = Math.ceil(
        (new Date(a.endDate).getTime() - now.getTime()) / MS_PER_DAY,
      );

      return {
        type: "ASSIGNMENT_ENDING" as const,
        title: "Assignment Ending Soon",
        description: `"${a.workout?.title}" ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,
        priority:
          daysRemaining <= 2 ? "HIGH" : daysRemaining <= 5 ? "MEDIUM" : "LOW",
        member: a.member,
        dueDate: a.endDate,
      };
    });
  }

  private calculateAchievements(metrics: {
    totalMembers: number;
    completedSessions: number;
    workoutsCreated: number;
    joinedAt: Date;
    now: Date;
  }) {
    const firstYearEarned =
      metrics.now.getTime() - new Date(metrics.joinedAt).getTime() >=
      MS_PER_DAY * 365;

    return [
      {
        title: "First Member",
        description: "Assigned your very first member",
        earned: metrics.totalMembers >= 1,
      },
      {
        title: "10 Members",
        description: "Coached 10 or more members",
        earned: metrics.totalMembers >= 10,
      },
      {
        title: "50 Members",
        description: "Coached 50 or more members",
        earned: metrics.totalMembers >= 50,
      },
      {
        title: "100 Completed Sessions",
        description: "Successfully recorded 100 completed workout sessions",
        earned: metrics.completedSessions >= 100,
      },
      {
        title: "10 Workouts Created",
        description: "Created 10 distinct workout templates",
        earned: metrics.workoutsCreated >= 10,
      },
      {
        title: "First Year Coaching",
        description: "Completed one full year on the platform",
        earned: firstYearEarned,
      },
    ];
  }
}

export default new CoachProfileService();
