// src/services/coach-access.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";

export interface CoachAccessContext {
  isAuthorized: boolean;
  relationship: any | null;
  hasActiveAssignment: boolean;
  canAccessHistory: boolean;
  relationshipStartDate: Date | null;
}

class CoachAccessService {
  /**
   * Returns all member IDs currently managed by a coach
   * (Union of active coach_member_relationships and active assignments).
   */
  async getManagedMemberIds(trainerId: string): Promise<string[]> {
    const [relationships, assignments] = await Promise.all([
      prisma.coachMemberRelationship.findMany({
        where: {
          trainerId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
        },
        select: { memberId: true },
      }),
      prisma.assignment.findMany({
        where: {
          trainerId,
          status: ASSIGNMENT_STATUS.ACTIVE,
          isActive: true,
        },
        select: { memberId: true },
      }),
    ]);

    const memberIdSet = new Set<string>();
    relationships.forEach((r) => memberIdSet.add(r.memberId));
    assignments.forEach((a) => memberIdSet.add(a.memberId));
    return Array.from(memberIdSet);
  }

  /**
   * Verifies whether a coach (or admin) can access a specific member.
   * If throwError is true (default), throws 403 AppError if unauthorized.
   */
  async verifyAccess(
    trainerId: string,
    memberId: string,
    role: Role,
    options: {
      requireRelationshipOnly?: boolean;
      throwError?: boolean;
    } = {},
  ): Promise<CoachAccessContext> {
    const { requireRelationshipOnly = false, throwError = true } = options;

    if (role === Roles.ADMIN) {
      return {
        isAuthorized: true,
        relationship: null,
        hasActiveAssignment: true,
        canAccessHistory: true,
        relationshipStartDate: null,
      };
    }

    if (role !== Roles.TRAINER) {
      if (throwError) {
        throw new AppError("Access denied.", 403);
      }
      return {
        isAuthorized: false,
        relationship: null,
        hasActiveAssignment: false,
        canAccessHistory: false,
        relationshipStartDate: null,
      };
    }

    // Check relationship
    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
      },
    });

    let hasActiveAssignment = false;
    if (!relationship && !requireRelationshipOnly) {
      const assignment = await prisma.assignment.findFirst({
        where: {
          trainerId,
          memberId,
          status: ASSIGNMENT_STATUS.ACTIVE,
          isActive: true,
        },
        select: { id: true },
      });
      hasActiveAssignment = Boolean(assignment);
    }

    const isAuthorized = Boolean(relationship || hasActiveAssignment);

    if (!isAuthorized && throwError) {
      throw new AppError("You are not authorized to access this member.", 403);
    }

    const canAccessHistory =
      relationship?.historySharingConsent === HISTORY_SHARING_CONSENT.GRANTED;
    const relationshipStartDate = relationship?.startedAt || null;

    return {
      isAuthorized,
      relationship,
      hasActiveAssignment,
      canAccessHistory,
      relationshipStartDate,
    };
  }

  /**
   * Checks whether a coach can view a specific WorkoutSession.
   * Respects:
   * 1. Direct assignment session
   * 2. Self-guided session if coach has an active relationship and history consent is granted
   *    or if session started on/after relationship started.
   */
  async canCoachAccessSession(
    trainerId: string,
    session: {
      memberId: string;
      assignmentId?: string | null;
      assignment?: { trainerId: string } | null;
      startedAt: Date;
    },
    role: Role,
  ): Promise<boolean> {
    if (role === Roles.ADMIN) return true;
    if (role !== Roles.TRAINER) return false;

    // 1. Direct assigned session
    if (session.assignment && session.assignment.trainerId === trainerId) {
      return true;
    }

    // Check relationship
    const access = await this.verifyAccess(trainerId, session.memberId, role, {
      throwError: false,
    });

    if (!access.isAuthorized) return false;

    // If coach has relationship with consent
    if (access.canAccessHistory) return true;

    // If coach has relationship without retroactive consent, check start date
    if (access.relationshipStartDate) {
      const sessionDate = new Date(session.startedAt);
      const relDate = new Date(access.relationshipStartDate);
      return sessionDate >= relDate;
    }

    // If only assignment-bound, only workouts of their assignment can be accessed
    return Boolean(
      session.assignment && session.assignment.trainerId === trainerId,
    );
  }
}

export default new CoachAccessService();
