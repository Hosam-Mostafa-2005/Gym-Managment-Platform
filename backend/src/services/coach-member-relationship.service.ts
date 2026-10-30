// src/services/coach-member-relationship.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
  type RelationshipStatus,
  type HistorySharingConsent,
} from "../constants/coaching-relationship.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import notificationService from "./notification.service.js";
import mapCoachingRelationship from "../mappers/coaching-relationship.mapper.js";
import type {
  InviteMemberDto,
  RespondInvitationDto,
  UpdateHistoryConsentDto,
} from "../types/coaching-relationship.types.js";

class CoachMemberRelationshipService {
  /**
   * Coach invites an existing member by email
   */
  async inviteMember(trainerId: string, dto: InviteMemberDto) {
    const trainer = await prisma.user.findFirst({
      where: {
        id: trainerId,
        isActive: true,
        role: { in: [Roles.TRAINER, Roles.ADMIN] },
      },
    });

    if (!trainer) {
      throw new AppError("Coach not found.", 404);
    }

    const email = dto.email.trim().toLowerCase();

    // Safely resolve member by email
    const member = await prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
    });

    if (!member) {
      throw new AppError(
        "No active member account found with this email address. Please ensure the member has registered on STREN before sending an invitation.",
        404,
      );
    }

    if (member.role !== Roles.MEMBER) {
      throw new AppError(
        "You can only invite users with the Member role.",
        400,
      );
    }

    if (member.id === trainerId) {
      throw new AppError("You cannot invite yourself.", 400);
    }

    // Check existing active or pending relationships
    const existingActive = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId: member.id,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
    });

    if (existingActive) {
      throw new AppError(
        "You already have an active coaching relationship with this member.",
        409,
      );
    }

    const existingPending = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId: member.id,
        status: RELATIONSHIP_STATUS.PENDING,
        isActive: true,
      },
    });

    if (existingPending) {
      throw new AppError(
        "A coaching invitation is already pending for this member.",
        409,
      );
    }

    // Atomic creation of invitation + notification
    const relationship = await prisma.$transaction(async (tx) => {
      const created = await tx.coachMemberRelationship.create({
        data: {
          trainerId,
          memberId: member.id,
          status: RELATIONSHIP_STATUS.PENDING,
          historySharingConsent: HISTORY_SHARING_CONSENT.PENDING,
          notes: dto.notes || null,
          invitedAt: new Date(),
        },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              specialties: true,
            },
          },
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return created;
    });

    // Create persistent notification for Member
    await notificationService.create({
      user: member.id,
      type: NOTIFICATION_TYPE.COACHING_INVITATION_RECEIVED,
      title: "Coaching Invitation Received",
      message: `Coach ${trainer.name} has invited you to start a coaching relationship.`,
      actionUrl: "/dashboard",
      metadata: {
        relationshipId: relationship.id,
        trainerId: trainer.id,
        trainerName: trainer.name,
      },
    });

    return mapCoachingRelationship(relationship);
  }

  /**
   * Get pending invitations sent by a Coach
   */
  async getCoachInvitations(trainerId: string) {
    const invitations = await prisma.coachMemberRelationship.findMany({
      where: {
        trainerId,
        status: RELATIONSHIP_STATUS.PENDING,
        isActive: true,
      },
      orderBy: { invitedAt: "desc" },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return invitations.map(mapCoachingRelationship);
  }

  /**
   * Coach cancels a pending invitation
   */
  async cancelInvitation(invitationId: string, trainerId: string) {
    const invitation = await prisma.coachMemberRelationship.findFirst({
      where: {
        id: invitationId,
        trainerId,
        status: RELATIONSHIP_STATUS.PENDING,
        isActive: true,
      },
    });

    if (!invitation) {
      throw new AppError("Pending invitation not found.", 404);
    }

    const updated = await prisma.coachMemberRelationship.update({
      where: { id: invitationId },
      data: {
        status: RELATIONSHIP_STATUS.REVOKED,
        terminatedAt: new Date(),
        notes: "Cancelled by coach.",
      },
      include: {
        member: { select: { id: true, name: true, email: true } },
        trainer: { select: { id: true, name: true, email: true } },
      },
    });

    return mapCoachingRelationship(updated);
  }

  /**
   * Get pending invitations received by a Member
   */
  async getMemberInvitations(memberId: string) {
    const invitations = await prisma.coachMemberRelationship.findMany({
      where: {
        memberId,
        status: RELATIONSHIP_STATUS.PENDING,
        isActive: true,
      },
      orderBy: { invitedAt: "desc" },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            specialties: true,
            bio: true,
            yearsOfExperience: true,
            professionalTitle: true,
            certifications: true,
            coachingPhilosophy: true,
          },
        },
      },
    });

    return invitations.map(mapCoachingRelationship);
  }

  /**
   * Get active coaching relationship for a Member
   */
  async getMemberActiveRelationship(memberId: string) {
    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        memberId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
      orderBy: { startedAt: "desc" },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            specialties: true,
            bio: true,
            yearsOfExperience: true,
            professionalTitle: true,
            certifications: true,
            coachingPhilosophy: true,
          },
        },
      },
    });

    return relationship ? mapCoachingRelationship(relationship) : null;
  }

  /**
   * Member terminates their current active coaching relationship directly
   */
  async terminateActiveMemberRelationship(memberId: string) {
    const active = await prisma.coachMemberRelationship.findFirst({
      where: {
        memberId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
      orderBy: { startedAt: "desc" },
    });

    if (!active) {
      throw new AppError("No active coaching relationship found.", 404);
    }

    return this.terminateRelationship(active.id, memberId, Roles.MEMBER);
  }

  /**
   * Member accepts or declines a coaching invitation
   */
  async respondInvitation(
    invitationId: string,
    memberId: string,
    dto: RespondInvitationDto,
  ) {
    const execute = async (tx: any) => {
      const invitation = await tx.coachMemberRelationship.findFirst({
        where: {
          id: invitationId,
          memberId,
          status: RELATIONSHIP_STATUS.PENDING,
          isActive: true,
        },
        include: {
          trainer: { select: { id: true, name: true, email: true } },
          member: { select: { id: true, name: true, email: true } },
        },
      });

      if (!invitation) {
        throw new AppError(
          "Pending coaching invitation not found or already processed.",
          404,
        );
      }

      const now = new Date();

      if (dto.action === "ACCEPT") {
        // Enforce: A member can have at most one active coach relationship at a time
        const existingActive = await tx.coachMemberRelationship.findFirst({
          where: {
            memberId,
            status: RELATIONSHIP_STATUS.ACTIVE,
            isActive: true,
          },
          include: {
            trainer: { select: { id: true, name: true, email: true } },
          },
        });

        if (existingActive && existingActive.id !== invitationId) {
          const currentCoachName = existingActive.trainer?.name || "a coach";
          throw new AppError(
            `You're already connected to a coach (${currentCoachName}). End your current coaching relationship before accepting a new coach.`,
            409,
            {
              code: "ACTIVE_COACH_EXISTS",
              currentCoach: {
                id: existingActive.trainerId,
                name: existingActive.trainer?.name,
                email: existingActive.trainer?.email,
                relationshipId: existingActive.id,
              },
            },
          );
        }

        const updated = await tx.coachMemberRelationship.update({
          where: { id: invitationId },
          data: {
            status: RELATIONSHIP_STATUS.ACTIVE,
            startedAt: now,
            respondedAt: now,
            // History sharing starts as PENDING until explicit consent
            historySharingConsent: HISTORY_SHARING_CONSENT.PENDING,
          },
          include: {
            trainer: { select: { id: true, name: true, email: true } },
            member: { select: { id: true, name: true, email: true } },
          },
        });

        return updated;
      } else {
        const updated = await tx.coachMemberRelationship.update({
          where: { id: invitationId },
          data: {
            status: RELATIONSHIP_STATUS.DECLINED,
            respondedAt: now,
          },
          include: {
            trainer: { select: { id: true, name: true, email: true } },
            member: { select: { id: true, name: true, email: true } },
          },
        });

        return updated;
      }
    };

    const updated =
      typeof (prisma as any).$transaction === "function"
        ? await (prisma as any).$transaction(execute)
        : await execute(prisma);

    // Send notifications outside the transaction
    if (dto.action === "ACCEPT") {
      await notificationService.create({
        user: updated.trainerId,
        type: NOTIFICATION_TYPE.COACHING_INVITATION_ACCEPTED,
        title: "Coaching Invitation Accepted",
        message: `${updated.member.name} accepted your coaching invitation.`,
        actionUrl: `/members/${updated.memberId}`,
        metadata: {
          relationshipId: updated.id,
          memberId: updated.memberId,
          memberName: updated.member.name,
        },
      });
    } else {
      await notificationService.create({
        user: updated.trainerId,
        type: NOTIFICATION_TYPE.COACHING_INVITATION_DECLINED,
        title: "Coaching Invitation Declined",
        message: `${updated.member.name} declined your coaching invitation.`,
        actionUrl: "/members/all",
        metadata: {
          relationshipId: updated.id,
          memberId: updated.memberId,
          memberName: updated.member.name,
        },
      });
    }

    return mapCoachingRelationship(updated);
  }

  /**
   * Member updates history sharing consent (GRANTED, DECLINED, or REVOKED)
   */
  async updateHistoryConsent(
    relationshipId: string,
    memberId: string,
    dto: UpdateHistoryConsentDto,
  ) {
    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        id: relationshipId,
        memberId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
    });

    if (!relationship) {
      throw new AppError(
        "Active coaching relationship not found for this member.",
        404,
      );
    }

    const consent = dto.consent;
    const now = new Date();

    const updated = await prisma.coachMemberRelationship.update({
      where: { id: relationshipId },
      data: {
        historySharingConsent: consent as HistorySharingConsent,
        historyConsentAt: now,
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify Coach based on consent choice
    if (consent === HISTORY_SHARING_CONSENT.GRANTED) {
      await notificationService.create({
        user: relationship.trainerId,
        type: NOTIFICATION_TYPE.HISTORY_SHARING_GRANTED,
        title: "Fitness History Sharing Granted",
        message: `${relationship.member.name} has granted you access to their pre-existing fitness history.`,
        actionUrl: `/members/${relationship.memberId}`,
        metadata: {
          relationshipId: updated.id,
          memberId: relationship.memberId,
        },
      });
    } else if (consent === HISTORY_SHARING_CONSENT.REVOKED) {
      await notificationService.create({
        user: relationship.trainerId,
        type: NOTIFICATION_TYPE.HISTORY_SHARING_REVOKED,
        title: "Fitness History Access Revoked",
        message: `${relationship.member.name} has revoked access to their pre-existing fitness history.`,
        actionUrl: `/members/${relationship.memberId}`,
        metadata: {
          relationshipId: updated.id,
          memberId: relationship.memberId,
        },
      });
    }

    return mapCoachingRelationship(updated);
  }

  /**
   * Either Coach or Member terminates active coaching relationship
   */
  async terminateRelationship(
    relationshipId: string,
    userId: string,
    role: Role,
  ) {
    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        id: relationshipId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
    });

    if (!relationship) {
      throw new AppError("Active coaching relationship not found.", 404);
    }

    if (
      role !== Roles.ADMIN &&
      relationship.trainerId !== userId &&
      relationship.memberId !== userId
    ) {
      throw new AppError(
        "You are not authorized to terminate this relationship.",
        403,
      );
    }

    const now = new Date();
    const updated = await prisma.coachMemberRelationship.update({
      where: { id: relationshipId },
      data: {
        status: RELATIONSHIP_STATUS.REVOKED,
        terminatedAt: now,
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        member: { select: { id: true, name: true, email: true } },
      },
    });

    // Deactivate custom exercise access granted by this trainer to this member
    await prisma.memberExerciseAccess.updateMany({
      where: {
        memberId: relationship.memberId,
        grantedById: relationship.trainerId,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    const isTerminatedByCoach = userId === relationship.trainerId;
    const recipientId = isTerminatedByCoach
      ? relationship.memberId
      : relationship.trainerId;
    const initiatorName = isTerminatedByCoach
      ? relationship.trainer.name
      : relationship.member.name;

    await notificationService.create({
      user: recipientId,
      type: NOTIFICATION_TYPE.COACHING_RELATIONSHIP_TERMINATED,
      title: "Coaching Relationship Ended",
      message: `${initiatorName} has ended the coaching relationship.`,
      actionUrl: isTerminatedByCoach ? "/profile" : "/members/all",
      metadata: {
        relationshipId: updated.id,
      },
    });

    return mapCoachingRelationship(updated);
  }

  /**
   * Verification helper for Coach Access to Member Data
   * Returns active relationship with startedAt & historySharingConsent
   */
  async getActiveRelationshipForPair(trainerId: string, memberId: string) {
    return prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId,
        status: RELATIONSHIP_STATUS.ACTIVE,
        isActive: true,
      },
    });
  }
}

export default new CoachMemberRelationshipService();
