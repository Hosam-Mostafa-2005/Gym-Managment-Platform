// src/services/member-insights.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";
import { mapMemberInsights } from "../mappers/member-insights.mapper.js";
import type {
  TimelineEvent,
  KPIs,
  Charts,
  WorkoutInsights,
  BodyInsights,
} from "../types/member-insights.types.js";

const MAX_HISTORY = 50;

class MemberInsightsService {
  private async checkTrainerAccess(trainerId: string, memberId: string) {
    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
    });

    const isAssigned = await prisma.assignment.findFirst({
      where: {
        trainerId,
        memberId,
        isActive: true,
        status: ASSIGNMENT_STATUS.ACTIVE,
      },
    });

    if (!relationship && !isAssigned) {
      throw new AppError("Member is not assigned to you.", 403);
    }

    return relationship || null;
  }

  private async getWorkoutStats(memberId: string, whereClause?: any) {
    const sessions = await prisma.workoutSession.findMany({
      where: {
        memberId,
        isActive: true,
        ...(whereClause || {}),
      },
      select: {
        status: true,
        duration: true,
        totalVolume: true,
      },
    });

    if (sessions.length === 0) return null;

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
    ).length;
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalVolume = sessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0);

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      totalVolume,
    };
  }

  private calculateStreaksAndAverages(dates: Date[]) {
    if (dates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        averageRestDays: 0,
        frequency: 0,
      };
    }

    const uniqueDates = [
      ...new Set(dates.map((d) => d.toISOString().split("T")[0])),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Current streak logic
    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let checkDate = new Date(
        uniqueDates[0] === todayStr ? todayStr : yesterdayStr,
      );
      for (const dateStr of uniqueDates) {
        if (dateStr === checkDate.toISOString().split("T")[0]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak & Average Rest logic
    let totalRestDays = 0;
    let restGaps = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      tempStreak = 1;
      let currDate = new Date(uniqueDates[i]);

      for (let j = i + 1; j < uniqueDates.length; j++) {
        const nextDate = new Date(uniqueDates[j]);
        const diffDays = Math.round(
          (currDate.getTime() - nextDate.getTime()) / (1000 * 3600 * 24),
        );

        if (diffDays === 1) {
          tempStreak++;
          currDate = nextDate;
        } else {
          totalRestDays += diffDays - 1;
          restGaps++;
          break;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    const averageRestDays =
      restGaps > 0 ? Math.round((totalRestDays / restGaps) * 10) / 10 : 0;

    const firstDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const lastDate = new Date(uniqueDates[0]);
    const totalWeeks = Math.max(
      1,
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24 * 7),
    );
    const frequency = Math.round((uniqueDates.length / totalWeeks) * 10) / 10;

    return { currentStreak, longestStreak, averageRestDays, frequency };
  }

  private getMeasurementValue(measurement: any, key: string): number {
    if (!measurement) return 0;
    if (measurement.circumferences && measurement.circumferences[key] != null) {
      return measurement.circumferences[key];
    }
    return measurement[key] || 0;
  }

  private getLimbTotal(
    measurement: any,
    leftKey: string,
    rightKey: string,
  ): number {
    return (
      this.getMeasurementValue(measurement, leftKey) +
      this.getMeasurementValue(measurement, rightKey)
    );
  }

  private buildBodyInsights(
    latestMeasurement: any,
    previousMeasurement: any,
    kpis: any,
  ): BodyInsights {
    return {
      weight: kpis.weightDifference,
      bodyFat: kpis.bodyFatDifference,
      chest:
        this.getMeasurementValue(latestMeasurement, "chest") -
        this.getMeasurementValue(previousMeasurement, "chest"),
      waist:
        this.getMeasurementValue(latestMeasurement, "waist") -
        this.getMeasurementValue(previousMeasurement, "waist"),
      hips:
        this.getMeasurementValue(latestMeasurement, "hips") -
        this.getMeasurementValue(previousMeasurement, "hips"),
      shoulders:
        this.getMeasurementValue(latestMeasurement, "shoulders") -
        this.getMeasurementValue(previousMeasurement, "shoulders"),
      neck:
        this.getMeasurementValue(latestMeasurement, "neck") -
        this.getMeasurementValue(previousMeasurement, "neck"),
      arms:
        this.getLimbTotal(latestMeasurement, "leftArm", "rightArm") -
        this.getLimbTotal(previousMeasurement, "leftArm", "rightArm"),
      thighs:
        this.getLimbTotal(latestMeasurement, "leftThigh", "rightThigh") -
        this.getLimbTotal(previousMeasurement, "leftThigh", "rightThigh"),
      calves:
        this.getLimbTotal(latestMeasurement, "leftCalf", "rightCalf") -
        this.getLimbTotal(previousMeasurement, "leftCalf", "rightCalf"),
    };
  }

  private buildCharts(measurements: any[], completedSessions: any[]): Charts {
    const measurementsAsc = [...measurements].reverse();
    const sessionsAsc = [...completedSessions].reverse();

    return {
      weight: measurementsAsc.map((m) => ({
        date: m.measuredAt.toISOString().split("T")[0],
        value: m.weight,
      })),
      bodyFat: measurementsAsc
        .filter((m) => m.bodyFat != null)
        .map((m) => ({
          date: m.measuredAt.toISOString().split("T")[0],
          value: m.bodyFat,
        })),
      workoutVolume: sessionsAsc.map((s) => ({
        date: s.startedAt?.toISOString().split("T")[0] || "",
        value: s.totalVolume,
      })),
      workoutDuration: sessionsAsc.map((s) => ({
        date: s.startedAt?.toISOString().split("T")[0] || "",
        value: s.duration,
      })),
    };
  }

  private buildTimeline(
    measurements: any[],
    sessions: any[],
    assignments: any[],
  ): TimelineEvent[] {
    const timelineEvents: TimelineEvent[] = [];

    measurements.forEach((m) => {
      timelineEvents.push({
        type: "BODY_MEASUREMENT_RECORDED",
        title: "Body Measurement Recorded",
        description: "A new body measurement was logged.",
        date: m.measuredAt || m.createdAt,
      });
    });

    sessions.forEach((s) => {
      const title = (s.assignment as any)?.workout?.title || "Unknown Workout";
      if (s.startedAt) {
        timelineEvents.push({
          type: "WORKOUT_STARTED",
          title: "Workout Started",
          description: `Started "${title}"`,
          date: s.startedAt,
        });
      }
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED && s.endedAt) {
        timelineEvents.push({
          type: "WORKOUT_COMPLETED",
          title: "Workout Completed",
          description: `Completed "${title}"`,
          date: s.endedAt,
        });
      }
    });

    assignments.forEach((a) => {
      const title = (a.workout as any)?.title || "Unknown Workout";
      timelineEvents.push({
        type: "WORKOUT_ASSIGNED",
        title: "Workout Assigned",
        description: `Assigned to "${title}"`,
        date: a.createdAt,
      });
      if (a.status === ASSIGNMENT_STATUS.COMPLETED && a.completedAt) {
        timelineEvents.push({
          type: "ASSIGNMENT_COMPLETED",
          title: "Assignment Completed",
          description: `Finished the "${title}" program`,
          date: a.completedAt,
        });
      }
      if (a.status === ASSIGNMENT_STATUS.CANCELLED && a.cancelledAt) {
        timelineEvents.push({
          type: "ASSIGNMENT_CANCELLED",
          title: "Assignment Cancelled",
          description: `Cancelled the "${title}" program`,
          date: a.cancelledAt,
        });
      }
    });

    timelineEvents.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return timelineEvents;
  }

  async getInsights(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    let relationship: any = null;
    if (role === Roles.TRAINER) {
      relationship = await this.checkTrainerAccess(userId, memberId);
    }

    const member = await prisma.user.findFirst({
      where: { id: memberId, isActive: true },
    });

    if (!member || member.role !== Roles.MEMBER) {
      throw new AppError("Member not found.", 404);
    }

    const isCoachViewing = role === Roles.TRAINER;
    const canAccessHistory =
      !isCoachViewing ||
      relationship?.historySharingConsent === HISTORY_SHARING_CONSENT.GRANTED;

    const relationshipStartDate = relationship?.startedAt || null;

    const sessionWhere: any = { memberId, isActive: true };
    const measurementWhere: any = { memberId, isActive: true };

    if (isCoachViewing && !canAccessHistory) {
      if (relationshipStartDate) {
        sessionWhere.startedAt = { gte: relationshipStartDate };
        measurementWhere.OR = [
          { trainerId: userId },
          { measuredAt: { gte: relationshipStartDate } },
        ];
      } else {
        sessionWhere.assignment = { trainerId: userId };
        measurementWhere.trainerId = userId;
      }
    }

    const [stats, measurements, sessions, assignments] = await Promise.all([
      this.getWorkoutStats(memberId, sessionWhere),

      prisma.bodyMeasurement.findMany({
        where: measurementWhere,
        orderBy: { measuredAt: "desc" },
        take: MAX_HISTORY,
      }),

      prisma.workoutSession.findMany({
        where: sessionWhere,
        select: {
          status: true,
          duration: true,
          totalVolume: true,
          startedAt: true,
          endedAt: true,
          assignment: {
            select: {
              workout: { select: { title: true } },
            },
          },
        },
        orderBy: { startedAt: "desc" },
      }),

      prisma.assignment.findMany({
        where: {
          memberId,
          isActive: true,
          ...(isCoachViewing ? { trainerId: userId } : {}),
        },
        select: {
          status: true,
          createdAt: true,
          completedAt: true,
          cancelledAt: true,
          workout: { select: { title: true } },
        },
      }),
    ]);

    const latestMeasurement = measurements[0] || null;
    const previousMeasurement = measurements[1] || null;

    const completionRate =
      stats && stats.totalSessions > 0
        ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
        : 0;

    const averageWorkoutDuration =
      stats && stats.completedSessions > 0
        ? Math.round(stats.totalDuration / stats.completedSessions)
        : 0;

    const kpis: KPIs = {
      currentWeight: latestMeasurement?.weight || 0,
      weightDifference:
        latestMeasurement && previousMeasurement
          ? Math.round(
              (latestMeasurement.weight - previousMeasurement.weight) * 10,
            ) / 10
          : 0,
      currentBodyFat: latestMeasurement?.bodyFat || 0,
      bodyFatDifference:
        latestMeasurement?.bodyFat != null &&
        previousMeasurement?.bodyFat != null
          ? Math.round(
              (latestMeasurement.bodyFat - previousMeasurement.bodyFat) * 10,
            ) / 10
          : 0,
      completionRate,
      totalSessions: stats?.totalSessions || 0,
      completedSessions: stats?.completedSessions || 0,
      averageWorkoutDuration,
      totalWorkoutVolume: stats?.totalVolume || 0,
    };

    const bodyInsights: BodyInsights = this.buildBodyInsights(
      latestMeasurement,
      previousMeasurement,
      kpis,
    );

    const completedSessions = sessions.filter(
      (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
    );
    const sessionDates = completedSessions
      .map((s) => s.startedAt)
      .filter(Boolean) as Date[];
    const streaksAndAverages = this.calculateStreaksAndAverages(sessionDates);

    const workoutInsights: WorkoutInsights = {
      currentStreak: streaksAndAverages.currentStreak,
      longestStreak: streaksAndAverages.longestStreak,
      lastWorkout: sessionDates.length > 0 ? sessionDates[0] : null,
      averageRestDays: streaksAndAverages.averageRestDays,
      workoutFrequency: streaksAndAverages.frequency,
      attendancePercentage: completionRate,
    };

    const charts: Charts = this.buildCharts(measurements, completedSessions);
    const timelineEvents = this.buildTimeline(
      measurements,
      sessions,
      assignments,
    );

    return mapMemberInsights({
      kpis,
      charts,
      workoutInsights,
      bodyInsights,
      timeline: timelineEvents.slice(0, MAX_HISTORY),
    });
  }
}

export default new MemberInsightsService();
