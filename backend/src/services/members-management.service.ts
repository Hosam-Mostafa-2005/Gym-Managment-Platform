// src/services/members-management.service.ts
import type { ParsedQs } from "qs";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { RELATIONSHIP_STATUS } from "../constants/coaching-relationship.js";
import { MEMBER_SORT } from "../constants/member.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import { mapMemberManagementCard } from "../mappers/members-management.mapper.js";
import type { MembersManagementResponse } from "../types/members-management.types.js";

class MembersManagementService {
  async getAllMembers(
    query: ParsedQs,
    userId: string,
    role: Role,
  ): Promise<MembersManagementResponse> {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const search = typeof query.search === "string" ? query.search.trim() : "";

    const userWhere: any = {
      role: Roles.MEMBER,
      isActive: true,
    };

    const conditions: any[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (role === Roles.TRAINER) {
      conditions.push({
        OR: [
          {
            coachingAsMember: {
              some: {
                trainerId: userId,
                status: RELATIONSHIP_STATUS.ACTIVE,
                isActive: true,
              },
            },
          },
          {
            assignmentsAsMember: {
              some: {
                trainerId: userId,
                status: ASSIGNMENT_STATUS.ACTIVE,
                isActive: true,
              },
            },
          },
        ],
      });
    }

    if (conditions.length > 0) {
      userWhere.AND = conditions;
    }

    const members = await prisma.user.findMany({
      where: userWhere,
      include: {
        coachingAsMember: {
          where: {
            isActive: true,
            status: RELATIONSHIP_STATUS.ACTIVE,
            ...(role === Roles.TRAINER ? { trainerId: userId } : {}),
          },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
        assignmentsAsMember: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          include: {
            trainer: { select: { id: true, name: true, email: true } },
            workout: { select: { id: true, title: true } },
          },
        },
        measurementsAsMember: {
          where: { isActive: true },
          orderBy: { measuredAt: "desc" },
          take: 1,
          select: { weight: true },
        },
        workoutSessions: {
          where: { isActive: true },
          select: { status: true, startedAt: true },
        },
      },
    });

    let processed = members.map((member) => {
      // Find active coaching relationship
      const activeCoaching = member.coachingAsMember?.[0] || null;
      const relationship = activeCoaching
        ? {
            id: activeCoaching.id,
            status: activeCoaching.status,
            historySharingConsent: activeCoaching.historySharingConsent,
            startedAt: activeCoaching.startedAt,
          }
        : null;

      // Find active assignments first, or fallback to latest assignment
      const activeAssignments = member.assignmentsAsMember.filter(
        (a) => a.status === ASSIGNMENT_STATUS.ACTIVE,
      );
      const currentAssignment =
        activeAssignments[0] || member.assignmentsAsMember[0] || null;

      const latestWeight = member.measurementsAsMember[0]?.weight ?? null;

      const totalSessions = member.workoutSessions.length;
      const completedSessions = member.workoutSessions.filter(
        (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
      ).length;

      const sortedSessions = [...member.workoutSessions].sort((a, b) => {
        const timeA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const timeB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return timeB - timeA;
      });
      const lastWorkoutDate = sortedSessions[0]?.startedAt || null;

      const completionRate =
        totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0;

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        isActive: member.isActive,
        createdAt: member.createdAt,
        currentAssignment,
        activeAssignments,
        trainer: currentAssignment?.trainer || null,
        workout: currentAssignment?.workout || null,
        relationship,
        latestWeight,
        totalSessions,
        completedSessions,
        lastWorkoutDate,
        completionRate,
      };
    });

    // Dynamic Assignment Filters
    if (query.status) {
      processed = processed.filter(
        (m) => m.currentAssignment?.status === query.status,
      );
    }

    if (role === Roles.ADMIN && query.trainer) {
      processed = processed.filter(
        (m) => m.currentAssignment?.trainerId === query.trainer,
      );
    }

    if (query.workout) {
      processed = processed.filter(
        (m) => m.currentAssignment?.workoutId === query.workout,
      );
    }

    // Sorting
    switch (query.sort) {
      case MEMBER_SORT.OLDEST:
        processed.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;

      case MEMBER_SORT.NAME:
        processed.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case MEMBER_SORT.LATEST_WORKOUT:
        processed.sort((a, b) => {
          const timeA = a.lastWorkoutDate
            ? new Date(a.lastWorkoutDate).getTime()
            : 0;
          const timeB = b.lastWorkoutDate
            ? new Date(b.lastWorkoutDate).getTime()
            : 0;
          return timeB - timeA;
        });
        break;

      case MEMBER_SORT.LATEST_WEIGHT:
        processed.sort((a, b) => (b.latestWeight || 0) - (a.latestWeight || 0));
        break;

      case MEMBER_SORT.COMPLETION_RATE:
        processed.sort((a, b) => b.completionRate - a.completionRate);
        break;

      default:
        processed.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    // Pagination
    const page = Math.max(parseInt(query.page as string) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(query.limit as string) || 10, 1),
      200,
    );
    const skip = (page - 1) * limit;

    const totalResults = processed.length;
    const totalPages = Math.ceil(totalResults / limit);
    const paginatedData = processed.slice(skip, skip + limit);

    return {
      members: paginatedData.map(mapMemberManagementCard),
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    };
  }
}

export default new MembersManagementService();
