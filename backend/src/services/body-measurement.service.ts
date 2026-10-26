// src/services/body-measurement.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { mapBodyMeasurement } from "../mappers/body-measurement.mapper.js";
import type {
  CreateBodyMeasurementDto,
  UpdateBodyMeasurementDto,
} from "../types/body-measurement.types.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import {
  RELATIONSHIP_STATUS,
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import gamificationService from "./gamification.service.js";

class BodyMeasurementService {
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

  async create(data: CreateBodyMeasurementDto, userId: string, role: Role) {
    let targetMemberId = (data.member as any)?.toString() || userId;
    let targetTrainerId: string | null = (data.trainer as any)?.toString() || null;

    if (role === Roles.MEMBER) {
      targetMemberId = userId;
      if (!targetTrainerId) {
        const activeAssignment = await prisma.assignment.findFirst({
          where: {
            memberId: userId,
            status: ASSIGNMENT_STATUS.ACTIVE,
            isActive: true,
          },
        });
        if (activeAssignment) {
          targetTrainerId = activeAssignment.trainerId;
        }
      }
    } else {
      const member = await prisma.user.findFirst({
        where: { id: targetMemberId, isActive: true },
      });

      if (!member) {
        throw new AppError("Member not found.", 404);
      }

      if (member.role !== Roles.MEMBER) {
        throw new AppError("Selected user is not a member.", 400);
      }

      if (role === Roles.TRAINER) {
        if (targetTrainerId && targetTrainerId !== userId) {
          throw new AppError(
            "Trainers can only create measurements under their own ID.",
            403,
          );
        }
        targetTrainerId = userId;
        await this.checkTrainerAccess(userId, targetMemberId);
      }
    }

    if (targetTrainerId) {
      const trainer = await prisma.user.findFirst({
        where: { id: targetTrainerId, isActive: true },
      });

      if (!trainer) {
        targetTrainerId = null;
      }
    }

    const c = data.circumferences || {};

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        memberId: targetMemberId,
        trainerId: targetTrainerId,
        weight: data.weight,
        height: data.height,
        bodyFat: data.bodyFat,
        chest: c.chest,
        waist: c.waist,
        hips: c.hips,
        shoulders: c.shoulders,
        neck: c.neck,
        leftArm: c.leftArm,
        rightArm: c.rightArm,
        leftThigh: c.leftThigh,
        rightThigh: c.rightThigh,
        leftCalf: c.leftCalf,
        rightCalf: c.rightCalf,
        notes: data.notes,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : new Date(),
      },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });

    if (role !== Roles.MEMBER) {
      await notificationService.create({
        user: targetMemberId,
        title: "New Body Measurement",
        message: "Your trainer recorded a new body measurement.",
        type: NOTIFICATION_TYPE.BODY_MEASUREMENT_CREATED,
        actionUrl: `/measurements`,
        metadata: {
          measurementId: measurement.id,
        },
      });
    }

    try {
      gamificationService.evaluateUserAchievements(targetMemberId).catch(() => {});
    } catch {
      // Safe fallback
    }

    return mapBodyMeasurement(measurement);
  }

  async getAllByMember(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER && userId !== memberId) {
      throw new AppError("You can only view your own measurements.", 403);
    }

    let relationship: any = null;
    if (role === Roles.TRAINER) {
      relationship = await this.checkTrainerAccess(userId, memberId);
    }

    const isCoachViewing = role === Roles.TRAINER;
    const canAccessHistory =
      !isCoachViewing ||
      relationship?.historySharingConsent === HISTORY_SHARING_CONSENT.GRANTED;

    const relationshipStartDate = relationship?.startedAt || null;

    const where: any = {
      memberId,
      isActive: true,
    };

    if (isCoachViewing && !canAccessHistory) {
      if (relationshipStartDate) {
        where.measuredAt = { gte: relationshipStartDate };
        // If consent is not granted, restrict to coach's own measurements or relationship period
        where.OR = [
          { trainerId: userId },
          { measuredAt: { gte: relationshipStartDate } },
        ];
      } else {
        // Assignment only or inactive relationship: strictly restrict to trainer's own created measurements
        where.trainerId = userId;
      }
    }

    const measurements = await prisma.bodyMeasurement.findMany({
      where,
      include: {
        trainer: { select: { id: true, name: true } },
      },
      orderBy: { measuredAt: "desc" },
    });

    return measurements.map(mapBodyMeasurement);
  }

  async getLatest(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER && userId !== memberId) {
      throw new AppError("You can only view your own measurements.", 403);
    }

    let relationship: any = null;
    if (role === Roles.TRAINER) {
      relationship = await this.checkTrainerAccess(userId, memberId);
    }

    const isCoachViewing = role === Roles.TRAINER;
    const canAccessHistory =
      !isCoachViewing ||
      relationship?.historySharingConsent === HISTORY_SHARING_CONSENT.GRANTED;

    const relationshipStartDate = relationship?.startedAt || null;

    const where: any = {
      memberId,
      isActive: true,
    };

    if (isCoachViewing && !canAccessHistory) {
      if (relationshipStartDate) {
        where.measuredAt = { gte: relationshipStartDate };
        // If consent is not granted, restrict to coach's own measurements or relationship period
        where.OR = [
          { trainerId: userId },
          { measuredAt: { gte: relationshipStartDate } },
        ];
      } else {
        // Assignment only or inactive relationship: strictly restrict to trainer's own created measurements
        where.trainerId = userId;
      }
    }

    const measurement = await prisma.bodyMeasurement.findFirst({
      where,
      include: {
        trainer: { select: { id: true, name: true } },
      },
      orderBy: { measuredAt: "desc" },
    });

    if (!measurement) {
      throw new AppError("No measurements found for this member.", 404);
    }

    return mapBodyMeasurement(measurement);
  }

  async getById(id: string, userId: string, role: Role) {
    const measurement = await prisma.bodyMeasurement.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });

    if (!measurement) {
      throw new AppError("Body measurement not found.", 404);
    }

    if (role === Roles.MEMBER && measurement.memberId !== userId) {
      throw new AppError("You can only view your own measurements.", 403);
    }

    if (role === Roles.TRAINER) {
      const relationship = await this.checkTrainerAccess(userId, measurement.memberId);
      if (measurement.trainerId !== userId) {
        if (
          !relationship ||
          relationship.historySharingConsent !== HISTORY_SHARING_CONSENT.GRANTED
        ) {
          throw new AppError("Access denied to this measurement.", 403);
        }
      }
    }

    return mapBodyMeasurement(measurement);
  }

  async update(
    id: string,
    data: UpdateBodyMeasurementDto,
    userId: string,
    role: Role,
  ) {
    const measurement = await prisma.bodyMeasurement.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!measurement) {
      throw new AppError("Body measurement not found.", 404);
    }

    if (role === Roles.MEMBER && measurement.memberId !== userId) {
      throw new AppError("You can only modify your own measurements.", 403);
    }

    if (role === Roles.TRAINER) {
      const relationship = await this.checkTrainerAccess(userId, measurement.memberId);
      if (measurement.trainerId !== userId) {
        if (
          !relationship ||
          relationship.historySharingConsent !== HISTORY_SHARING_CONSENT.GRANTED
        ) {
          throw new AppError("Access denied to this measurement.", 403);
        }
      }
    }

    const c = data.circumferences;

    const updated = await prisma.bodyMeasurement.update({
      where: { id },
      data: {
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.bodyFat !== undefined && { bodyFat: data.bodyFat }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.measuredAt !== undefined && {
          measuredAt: new Date(data.measuredAt),
        }),
        ...(c && {
          ...(c.chest !== undefined && { chest: c.chest }),
          ...(c.waist !== undefined && { waist: c.waist }),
          ...(c.hips !== undefined && { hips: c.hips }),
          ...(c.shoulders !== undefined && { shoulders: c.shoulders }),
          ...(c.neck !== undefined && { neck: c.neck }),
          ...(c.leftArm !== undefined && { leftArm: c.leftArm }),
          ...(c.rightArm !== undefined && { rightArm: c.rightArm }),
          ...(c.leftThigh !== undefined && { leftThigh: c.leftThigh }),
          ...(c.rightThigh !== undefined && { rightThigh: c.rightThigh }),
          ...(c.leftCalf !== undefined && { leftCalf: c.leftCalf }),
          ...(c.rightCalf !== undefined && { rightCalf: c.rightCalf }),
        }),
      },
      include: {
        trainer: { select: { id: true, name: true } },
      },
    });

    return mapBodyMeasurement(updated);
  }

  async delete(id: string, userId: string, role: Role) {
    const measurement = await prisma.bodyMeasurement.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!measurement) {
      throw new AppError("Body measurement not found.", 404);
    }

    if (role === Roles.MEMBER && measurement.memberId !== userId) {
      throw new AppError("You can only delete your own measurements.", 403);
    }

    if (role === Roles.TRAINER) {
      const relationship = await this.checkTrainerAccess(userId, measurement.memberId);
      if (measurement.trainerId !== userId) {
        if (
          !relationship ||
          relationship.historySharingConsent !== HISTORY_SHARING_CONSENT.GRANTED
        ) {
          throw new AppError("Access denied to this measurement.", 403);
        }
      }
    }

    await prisma.bodyMeasurement.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new BodyMeasurementService();
