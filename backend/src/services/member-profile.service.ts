// src/services/member-profile.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";
import { mapMemberProfile } from "../mappers/member-profile.mapper.js";
import type { TimelineEvent } from "../types/member-profile.types.js";

class MemberProfileService {
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

  private calculatePeriodStats(sessions: any[]) {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalDuration: 0,
        totalVolume: 0,
        completionRate: 0,
      };
    }

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(
      (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
    ).length;
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalVolume = sessions.reduce(
      (acc, s) => acc + (s.totalVolume || 0),
      0,
    );
    const completionRate =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      totalVolume,
      completionRate,
    };
  }

  private buildTimeline(
    currentAssignment: any,
    assignmentHistory: any[],
    measurements: any[],
    sessions: any[],
  ): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];

    const allAssignments = currentAssignment
      ? [currentAssignment, ...assignmentHistory]
      : assignmentHistory;

    allAssignments.forEach((a: any) => {
      const workoutTitle = (a.workout as any)?.title || "Unknown Workout";

      timeline.push({
        type: "WORKOUT_ASSIGNED",
        title: "Workout Assigned",
        description: `Assigned "${workoutTitle}"`,
        date: a.createdAt,
      });

      if (a.completedAt) {
        timeline.push({
          type: "ASSIGNMENT_COMPLETED",
          title: "Assignment Completed",
          description: `Completed "${workoutTitle}"`,
          date: a.completedAt,
        });
      }

      if (a.cancelledAt) {
        timeline.push({
          type: "ASSIGNMENT_CANCELLED",
          title: "Assignment Cancelled",
          description: a.cancelReason || "Assignment cancelled.",
          date: a.cancelledAt,
        });
      }
    });

    sessions.forEach((s: any) => {
      const workoutTitle =
        (s.workout as any)?.title ||
        (s.assignment as any)?.workout?.title ||
        "Workout";

      timeline.push({
        type: "WORKOUT_STARTED",
        title: "Workout Started",
        description: `Started "${workoutTitle}"`,
        date: s.startedAt,
      });

      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED && s.endedAt) {
        timeline.push({
          type: "WORKOUT_COMPLETED",
          title: "Workout Completed",
          description: `Completed "${workoutTitle}"`,
          date: s.endedAt,
        });
      }
    });

    measurements.forEach((m: any) => {
      timeline.push({
        type: "BODY_MEASUREMENT_RECORDED",
        title: "Body Measurement Recorded",
        description: "A new body measurement was recorded.",
        date: m.measuredAt || m.createdAt,
      });
    });

    timeline.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return timeline.slice(0, 20);
  }

  async getProfile(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER && userId !== memberId) {
      throw new AppError("You can only view your own profile.", 403);
    }

    let relationship: any = null;

    if (role === Roles.TRAINER) {
      relationship = await this.checkTrainerAccess(userId, memberId);
    } else {
      relationship = await prisma.coachMemberRelationship.findFirst({
        where: {
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
        },
        include: {
          trainer: { select: { id: true, name: true, email: true } },
        },
      });
    }

    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        isActive: true,
      },
    });

    if (!member) {
      throw new AppError("Member not found.", 404);
    }

    if (member.role !== Roles.MEMBER) {
      throw new AppError("Selected user is not a member.", 400);
    }

    const isCoachViewing = role === Roles.TRAINER;
    const canAccessHistory =
      !isCoachViewing ||
      relationship?.historySharingConsent === HISTORY_SHARING_CONSENT.GRANTED;

    const relationshipStartDate = relationship?.startedAt || null;

    // Build query filters enforcing history privacy
    const sessionWhere: any = {
      memberId,
      isActive: true,
    };
    const measurementWhere: any = {
      memberId,
      isActive: true,
    };

    // If Coach is viewing without consent, NEVER query records before relationship started!
    if (isCoachViewing && !canAccessHistory) {
      if (relationshipStartDate) {
        sessionWhere.startedAt = { gte: relationshipStartDate };
        measurementWhere.measuredAt = { gte: relationshipStartDate };
      } else {
        // Coach has no active relationship (assignment only) - cannot view private history
        sessionWhere.assignment = { trainerId: userId };
        measurementWhere.trainerId = userId;
      }
    }

    const [
      activeAssignmentsRaw,
      assignmentHistory,
      measurements,
      sessions,
    ] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          memberId,
          status: ASSIGNMENT_STATUS.ACTIVE,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
        include: {
          workout: { select: { id: true, title: true, category: true, difficulty: true } },
          trainer: { select: { id: true, name: true } },
        },
      }),

      prisma.assignment.findMany({
        where: {
          memberId,
          status: { not: ASSIGNMENT_STATUS.ACTIVE },
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
        include: {
          workout: { select: { title: true } },
          trainer: { select: { name: true } },
        },
      }),

      prisma.bodyMeasurement.findMany({
        where: measurementWhere,
        orderBy: { measuredAt: "desc" },
        take: 30,
      }),

      prisma.workoutSession.findMany({
        where: sessionWhere,
        orderBy: { startedAt: "desc" },
        take: 30,
        include: {
          workout: {
            select: { id: true, title: true },
          },
          assignment: {
            select: {
              workout: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    // Separate Historical vs Current Coach Progress
    const historicalSessions: any[] = [];
    const currentCoachSessions: any[] = [];

    for (const s of sessions) {
      if (
        relationshipStartDate &&
        s.startedAt &&
        new Date(s.startedAt) < new Date(relationshipStartDate)
      ) {
        historicalSessions.push(s);
      } else {
        currentCoachSessions.push(s);
      }
    }

    const historicalMeasurements: any[] = [];
    const currentCoachMeasurements: any[] = [];

    for (const m of measurements) {
      if (
        relationshipStartDate &&
        m.measuredAt &&
        new Date(m.measuredAt) < new Date(relationshipStartDate)
      ) {
        historicalMeasurements.push(m);
      } else {
        currentCoachMeasurements.push(m);
      }
    }

    // Compute period-specific stats & comparisons
    const historicalStats = canAccessHistory
      ? this.calculatePeriodStats(historicalSessions)
      : null;
    const currentCoachStats = this.calculatePeriodStats(currentCoachSessions);
    const overallStats = this.calculatePeriodStats(sessions);

    // Weight comparison
    const preCoachWeight =
      historicalMeasurements.length > 0
        ? historicalMeasurements[0].weight
        : null;
    const currentWeight =
      currentCoachMeasurements.length > 0
        ? currentCoachMeasurements[0].weight
        : preCoachWeight;
    const weightChange =
      preCoachWeight !== null && currentWeight !== null
        ? Math.round((currentWeight - preCoachWeight) * 10) / 10
        : null;

    const weightComparison = {
      preCoachWeight,
      currentWeight,
      weightChange,
    };

    const currentAssignment = activeAssignmentsRaw[0] || null;

    const timeline = this.buildTimeline(
      currentAssignment,
      assignmentHistory,
      measurements,
      sessions,
    );

    return mapMemberProfile({
      member,
      currentAssignment,
      activeAssignments: activeAssignmentsRaw,
      assignmentHistory,
      measurements,
      workoutStats: overallStats,
      recentSessions: sessions,
      timeline,
      coachingRelationship: relationship,
      historicalSessions,
      currentCoachSessions,
      historicalMeasurements,
      currentCoachMeasurements,
      historicalStats,
      currentCoachStats,
      weightComparison,
      canAccessHistory,
    });
  }
}

export default new MemberProfileService();
