import type { ParsedQs } from "qs";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { RELATIONSHIP_STATUS } from "../constants/coaching-relationship.js";

import mapAssignment from "../mappers/assignment.mapper.js";

import type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from "../types/assignment.types.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

class AssignmentService {
  async create(data: CreateAssignmentDto, trainerId: string, role: Role) {
    const selectedTrainerId =
      role === Roles.ADMIN ? data.trainer || trainerId : trainerId;

    const member = await prisma.user.findFirst({
      where: {
        id: data.member,
        isActive: true,
      },
    });

    if (!member) {
      throw new AppError("Member not found.", 404);
    }

    if (member.role !== Roles.MEMBER) {
      throw new AppError("Selected user is not a member.", 400);
    }

    const trainer = await prisma.user.findFirst({
      where: {
        id: selectedTrainerId,
        isActive: true,
      },
    });

    if (!trainer) {
      throw new AppError("Trainer not found.", 404);
    }

    if (trainer.role !== Roles.TRAINER) {
      throw new AppError("Selected user is not a trainer.", 400);
    }

    const workout = await prisma.workout.findFirst({
      where: {
        id: data.workout,
        isActive: true,
      },
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    if (
      role !== Roles.ADMIN &&
      workout.createdBy !== trainerId &&
      !workout.isTemplate
    ) {
      throw new AppError(
        "Coaches can only assign workouts they created or template workouts.",
        403,
      );
    }

    if (role !== Roles.ADMIN) {
      const activeRelationship = await prisma.coachMemberRelationship.findFirst({
        where: {
          trainerId: selectedTrainerId,
          memberId: data.member,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
        },
      });

      const activeAssignment = await prisma.assignment.findFirst({
        where: {
          trainerId: selectedTrainerId,
          memberId: data.member,
          isActive: true,
          status: ASSIGNMENT_STATUS.ACTIVE,
        },
      });

      if (!activeRelationship && !activeAssignment) {
        throw new AppError(
          "Unauthorized: You can only assign workouts to members with an active coaching relationship.",
          403,
        );
      }
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new AppError("End date must be after start date.", 400);
    }

    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        memberId: data.member,
        workoutId: data.workout,
        status: ASSIGNMENT_STATUS.ACTIVE,
        isActive: true,
      },
    });

    if (existingAssignment) {
      throw new AppError(
        "This workout is already assigned to this member.",
        409,
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        memberId: data.member,
        trainerId: selectedTrainerId,
        workoutId: data.workout,
        startDate,
        endDate,
        status: (data.status as any) ?? ASSIGNMENT_STATUS.ACTIVE,
        notes: data.notes,
      },
      include: {
        member: { select: { id: true, name: true, email: true } },
        trainer: { select: { id: true, name: true, email: true } },
        workout: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            estimatedDuration: true,
          },
        },
      },
    });

    await notificationService.create({
      user: assignment.memberId,
      title: "New Workout Assigned",
      message: "A trainer assigned a new workout program to you.",
      type: NOTIFICATION_TYPE.ASSIGNMENT_CREATED,
      actionUrl: `/assignments/${assignment.id}`,
      metadata: {
        assignmentId: assignment.id,
        workoutId: assignment.workoutId,
        trainerId: assignment.trainerId,
      },
    });

    return mapAssignment(assignment);
  }

  async getAll(query: ParsedQs, userId: string, role: Role) {
    const baseFilter: any =
      role === Roles.ADMIN
        ? { isActive: true }
        : {
            isActive: true,
            trainerId: userId,
          };

    // Map query keys from MongoDB (member -> memberId, trainer -> trainerId, workout -> workoutId)
    const normalizedQuery: Record<string, any> = { ...query };
    if (normalizedQuery.member) {
      normalizedQuery.memberId = normalizedQuery.member;
      delete normalizedQuery.member;
    }
    if (normalizedQuery.trainer) {
      normalizedQuery.trainerId = normalizedQuery.trainer;
      delete normalizedQuery.trainer;
    }
    if (normalizedQuery.workout) {
      normalizedQuery.workoutId = normalizedQuery.workout;
      delete normalizedQuery.workout;
    }

    const allowedFilters =
      role === Roles.ADMIN
        ? ["status", "memberId", "trainerId", "workoutId"]
        : ["status", "memberId", "workoutId"];

    const features = new ApiFeatures(baseFilter, normalizedQuery)
      .filter(allowedFilters)
      .sort()
      .paginate();

    const [total, active, completed, cancelled, assignments] = await Promise.all([
      prisma.assignment.count({ where: baseFilter }),
      prisma.assignment.count({
        where: {
          ...baseFilter,
          status: ASSIGNMENT_STATUS.ACTIVE,
        },
      }),
      prisma.assignment.count({
        where: {
          ...baseFilter,
          status: ASSIGNMENT_STATUS.COMPLETED,
        },
      }),
      prisma.assignment.count({
        where: {
          ...baseFilter,
          status: ASSIGNMENT_STATUS.CANCELLED,
        },
      }),
      prisma.assignment.findMany({
        where: features.prismaWhere,
        orderBy: features.prismaOrderBy,
        skip: features.prismaSkip,
        take: features.prismaTake,
        include: {
          member: { select: { id: true, name: true, email: true } },
          trainer: { select: { id: true, name: true, email: true } },
          workout: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              difficulty: true,
              estimatedDuration: true,
            },
          },
        },
      }),
    ]);

    return {
      assignments: assignments.map(mapAssignment),
      stats: {
        total,
        active,
        completed,
        cancelled,
      },
      totalResults: total,
    };
  }

  async getById(id: string, userId: string, role: Role) {
    const filter =
      role === Roles.ADMIN
        ? {
            id,
            isActive: true,
          }
        : {
            id,
            isActive: true,
            trainerId: userId,
          };

    const assignment = await prisma.assignment.findFirst({
      where: filter,
      include: {
        member: { select: { id: true, name: true, email: true, role: true } },
        trainer: { select: { id: true, name: true, email: true, role: true } },
        workout: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    return mapAssignment({
      ...assignment,
      workout: {
        ...assignment.workout,
        createdBy: assignment.workout.creator,
      },
    });
  }

  async getMyAssignments(memberId: string) {
    const assignments = await prisma.assignment.findMany({
      where: {
        memberId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return assignments.map(mapAssignment);
  }

  async update(
    id: string,
    data: UpdateAssignmentDto,
    userId: string,
    role: Role,
  ) {
    const filter =
      role === Roles.ADMIN
        ? {
            id,
            isActive: true,
          }
        : {
            id,
            isActive: true,
            trainerId: userId,
          };

    const assignment = await prisma.assignment.findFirst({
      where: filter,
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    if (data.member) {
      const member = await prisma.user.findFirst({
        where: {
          id: data.member,
          isActive: true,
        },
      });

      if (!member) {
        throw new AppError("Member not found.", 404);
      }

      if (member.role !== Roles.MEMBER) {
        throw new AppError("Selected user is not a member.", 400);
      }

      if (role !== Roles.ADMIN && data.member !== assignment.memberId) {
        const activeRelationship = await prisma.coachMemberRelationship.findFirst({
          where: {
            trainerId: userId,
            memberId: data.member,
            status: RELATIONSHIP_STATUS.ACTIVE,
            isActive: true,
          },
        });

        const activeAssignment = await prisma.assignment.findFirst({
          where: {
            trainerId: userId,
            memberId: data.member,
            isActive: true,
            status: ASSIGNMENT_STATUS.ACTIVE,
          },
        });

        if (!activeRelationship && !activeAssignment) {
          throw new AppError(
            "Unauthorized: You can only assign workouts to members with an active coaching relationship.",
            403,
          );
        }
      }
    }

    if (role !== Roles.ADMIN) {
      delete data.trainer;
    }

    if (data.trainer) {
      const trainer = await prisma.user.findFirst({
        where: {
          id: data.trainer,
          isActive: true,
        },
      });

      if (!trainer) {
        throw new AppError("Trainer not found.", 404);
      }

      if (trainer.role !== Roles.TRAINER) {
        throw new AppError("Selected user is not a trainer.", 400);
      }
    }

    if (data.workout) {
      const workoutFilter =
        role === Roles.ADMIN
          ? {
              id: data.workout,
              isActive: true,
              createdBy: data.trainer ?? assignment.trainerId,
            }
          : {
              id: data.workout,
              isActive: true,
              createdBy: userId,
            };

      const workout = await prisma.workout.findFirst({
        where: workoutFilter,
      });

      if (!workout) {
        throw new AppError("Workout not found.", 404);
      }
    }

    const checkMemberId = data.member ?? assignment.memberId;
    const checkWorkoutId = data.workout ?? assignment.workoutId;

    const duplicate = await prisma.assignment.findFirst({
      where: {
        memberId: checkMemberId,
        workoutId: checkWorkoutId,
        status: ASSIGNMENT_STATUS.ACTIVE,
        isActive: true,
        id: { not: assignment.id },
      },
    });

    if (duplicate) {
      throw new AppError(
        "This workout is already assigned to this member.",
        409,
      );
    }

    const startDate = data.startDate ? new Date(data.startDate) : assignment.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : assignment.endDate;

    if (startDate >= endDate) {
      throw new AppError("End date must be after start date.", 400);
    }

    if (data.status === ASSIGNMENT_STATUS.CANCELLED && !data.cancelReason) {
      throw new AppError("Cancel reason is required.", 400);
    }

    if (
      data.status &&
      data.status !== ASSIGNMENT_STATUS.CANCELLED &&
      data.cancelReason
    ) {
      throw new AppError(
        "Cancel reason can only be provided for cancelled assignments.",
        400,
      );
    }

    const previousStatus = assignment.status;
    const previousWorkout = assignment.workoutId;
    const previousStartDate = assignment.startDate;
    const previousEndDate = assignment.endDate;

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(data.member !== undefined && { memberId: data.member }),
        ...(data.trainer !== undefined && { trainerId: data.trainer }),
        ...(data.workout !== undefined && { workoutId: data.workout }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.status !== undefined && { status: data.status as any }),
        ...(data.cancelReason !== undefined && { cancelReason: data.cancelReason }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status === ASSIGNMENT_STATUS.CANCELLED && { cancelledAt: new Date() }),
        ...(data.status === ASSIGNMENT_STATUS.COMPLETED && { completedAt: new Date() }),
      },
      include: {
        member: { select: { id: true, name: true, email: true } },
        trainer: { select: { id: true, name: true, email: true } },
        workout: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            estimatedDuration: true,
          },
        },
      },
    });

    const changed =
      previousStatus !== updatedAssignment.status ||
      previousWorkout !== updatedAssignment.workoutId ||
      previousStartDate.getTime() !== updatedAssignment.startDate.getTime() ||
      previousEndDate.getTime() !== updatedAssignment.endDate.getTime();

    if (updatedAssignment.status === ASSIGNMENT_STATUS.CANCELLED) {
      await notificationService.create({
        user: updatedAssignment.memberId,
        title: "Workout Assignment Cancelled",
        message:
          updatedAssignment.cancelReason ?? "Your assignment has been cancelled.",
        type: NOTIFICATION_TYPE.ASSIGNMENT_CANCELLED,
        actionUrl: `/assignments/${updatedAssignment.id}`,
        metadata: {
          assignmentId: updatedAssignment.id,
        },
      });
    } else if (changed) {
      await notificationService.create({
        user: updatedAssignment.memberId,
        title: "Workout Assignment Updated",
        message: "Your workout assignment has been updated.",
        type: NOTIFICATION_TYPE.ASSIGNMENT_UPDATED,
        actionUrl: `/assignments/${updatedAssignment.id}`,
        metadata: {
          assignmentId: updatedAssignment.id,
        },
      });
    }

    return mapAssignment(updatedAssignment);
  }

  async delete(id: string, userId: string, role: Role) {
    const filter =
      role === Roles.ADMIN
        ? {
            id,
            isActive: true,
          }
        : {
            id,
            isActive: true,
            trainerId: userId,
          };

    const assignment = await prisma.assignment.findFirst({
      where: filter,
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    const sessionExists = await prisma.workoutSession.findFirst({
      where: {
        assignmentId: assignment.id,
      },
    });

    if (sessionExists) {
      throw new AppError(
        "Cannot delete an assignment that already has workout sessions.",
        409,
      );
    }

    await prisma.assignment.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new AssignmentService();
