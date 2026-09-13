import type { ParsedQs } from "qs";
import WorkoutSession from "../models/WorkoutSession.model.js";
import { Assignment } from "../models/Assignment.model.js";
import Workout from "../models/Workout.model.js";
import User from "../models/User.model.js";

import AppError from "../utils/AppError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

import mapAssignment from "../utils/assignment.mapper.js";

import type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from "../types/assignment.types.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

class AssignmentService {
  async create(data: CreateAssignmentDto, trainerId: string, role: Role) {
    const assignmentData =
      role === Roles.ADMIN
        ? data
        : {
            ...data,
            trainer: trainerId,
          };

    const member = await User.findOne({
      _id: assignmentData.member,
      isActive: true,
    });

    if (!member) {
      throw new AppError("Member not found.", 404);
    }

    if (member.role !== Roles.MEMBER) {
      throw new AppError("Selected user is not a member.", 400);
    }

    const trainer = await User.findOne({
      _id: assignmentData.trainer,
      isActive: true,
    });

    if (!trainer) {
      throw new AppError("Trainer not found.", 404);
    }

    if (trainer.role !== Roles.TRAINER) {
      throw new AppError("Selected user is not a trainer.", 400);
    }

    const workoutFilter =
      role === Roles.ADMIN
        ? {
            _id: assignmentData.workout,
            isActive: true,
            createdBy: assignmentData.trainer,
          }
        : {
            _id: assignmentData.workout,
            isActive: true,
            createdBy: trainerId,
          };

    const workout = await Workout.findOne(workoutFilter);

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    if (assignmentData.startDate >= assignmentData.endDate) {
      throw new AppError("End date must be after start date.", 400);
    }

    const existingAssignment = await Assignment.findOne({
      member: assignmentData.member,
      workout: assignmentData.workout,
      status: ASSIGNMENT_STATUS.ACTIVE,
      isActive: true,
    });

    if (existingAssignment) {
      throw new AppError(
        "This workout is already assigned to this member.",
        409,
      );
    }

    const assignment = await Assignment.create(assignmentData);

    await notificationService.create({
      user: assignment.member,
      title: "New Workout Assigned",
      message: "A trainer assigned a new workout program to you.",
      type: NOTIFICATION_TYPE.ASSIGNMENT_CREATED,
      actionUrl: `/assignments/${assignment.id}`,
      metadata: {
        assignmentId: assignment.id,
        workoutId: assignment.workout,
        trainerId: assignment.trainer,
      },
    });

    return mapAssignment(assignment);
  }

  async getAll(query: ParsedQs, userId: string, role: Role) {
    const filter =
      role === Roles.ADMIN
        ? { isActive: true }
        : {
            isActive: true,
            trainer: userId,
          };

    const features = new ApiFeatures(
      Assignment.find(filter)
        .populate("member", "name email")
        .populate("trainer", "name email")
        .populate("workout", "title"),
      query,
    )
      .filter()
      .sort()
      .paginate();

    const total = await Assignment.countDocuments(filter);

    const active = await Assignment.countDocuments({
      ...filter,
      status: ASSIGNMENT_STATUS.ACTIVE,
    });

    const completed = await Assignment.countDocuments({
      ...filter,
      status: ASSIGNMENT_STATUS.COMPLETED,
    });

    const cancelled = await Assignment.countDocuments({
      ...filter,
      status: ASSIGNMENT_STATUS.CANCELLED,
    });

    const assignments = await features.query;

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
            _id: id,
            isActive: true,
          }
        : {
            _id: id,
            isActive: true,
            trainer: userId,
          };

    const assignment = await Assignment.findOne(filter)
      .populate("member", "name email role")
      .populate("trainer", "name email role")
      .populate({
        path: "workout",
        populate: {
          path: "createdBy",
          select: "name email",
        },
      });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    return mapAssignment(assignment);
  }

  async getMyAssignments(memberId: string) {
    return await Assignment.find({
      member: memberId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("trainer", "name email")
      .populate({
        path: "workout",
        populate: {
          path: "exercises.exercise",
        },
      });
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
            _id: id,
            isActive: true,
          }
        : {
            _id: id,
            isActive: true,
            trainer: userId,
          };

    const assignment = await Assignment.findOne(filter);

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    if (data.member) {
      const member = await User.findOne({
        _id: data.member,
        isActive: true,
      });

      if (!member) {
        throw new AppError("Member not found.", 404);
      }

      if (member.role !== Roles.MEMBER) {
        throw new AppError("Selected user is not a member.", 400);
      }
    }
    if (role !== Roles.ADMIN) {
      delete data.trainer;
    }
    if (data.trainer) {
      const trainer = await User.findOne({
        _id: data.trainer,
        isActive: true,
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
              _id: data.workout,
              isActive: true,
              createdBy: data.trainer ?? assignment.trainer,
            }
          : {
              _id: data.workout,
              isActive: true,
              createdBy: userId,
            };

      const workout = await Workout.findOne(workoutFilter);

      if (!workout) {
        throw new AppError("Workout not found.", 404);
      }
    }
    const duplicate = await Assignment.findOne({
      member: data.member ?? assignment.member,
      workout: data.workout ?? assignment.workout,
      status: ASSIGNMENT_STATUS.ACTIVE,
      isActive: true,
      _id: { $ne: assignment._id },
    });

    if (duplicate) {
      throw new AppError(
        "This workout is already assigned to this member.",
        409,
      );
    }

    const startDate = data.startDate ?? assignment.startDate;
    const endDate = data.endDate ?? assignment.endDate;

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
    const previousWorkout = assignment.workout.toString();
    const previousStartDate = assignment.startDate;
    const previousEndDate = assignment.endDate;

    // تحديث التواريخ حسب الحالة الجديدة
    if (data.status === ASSIGNMENT_STATUS.CANCELLED) {
      assignment.cancelledAt = new Date();
    }

    if (data.status === ASSIGNMENT_STATUS.COMPLETED) {
      assignment.completedAt = new Date();
    }

    Object.assign(assignment, data);

    await assignment.save();

    const changed =
      previousStatus !== assignment.status ||
      previousWorkout !== assignment.workout.toString() ||
      previousStartDate.getTime() !== assignment.startDate.getTime() ||
      previousEndDate.getTime() !== assignment.endDate.getTime();

    // لو اتلغى ابعت Notification الإلغاء فقط
    if (assignment.status === ASSIGNMENT_STATUS.CANCELLED) {
      await notificationService.create({
        user: assignment.member,
        title: "Workout Assignment Cancelled",
        message:
          assignment.cancelReason ?? "Your assignment has been cancelled.",
        type: NOTIFICATION_TYPE.ASSIGNMENT_CANCELLED,
        actionUrl: `/assignments/${assignment.id}`,
        metadata: {
          assignmentId: assignment.id,
        },
      });
    }
    // غير كده لو اتعدل ابعت Notification التعديل
    else if (changed) {
      await notificationService.create({
        user: assignment.member,
        title: "Workout Assignment Updated",
        message: "Your workout assignment has been updated.",
        type: NOTIFICATION_TYPE.ASSIGNMENT_UPDATED,
        actionUrl: `/assignments/${assignment.id}`,
        metadata: {
          assignmentId: assignment.id,
        },
      });
    }

    return mapAssignment(assignment);
  }

  async delete(id: string, userId: string, role: Role) {
    const filter =
      role === Roles.ADMIN
        ? {
            _id: id,
            isActive: true,
          }
        : {
            _id: id,
            isActive: true,
            trainer: userId,
          };

    const assignment = await Assignment.findOne(filter);

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }
    const sessionExists = await WorkoutSession.exists({
      assignment: assignment._id,
    });

    if (sessionExists) {
      throw new AppError(
        "Cannot delete an assignment that already has workout sessions.",
        409,
      );
    }

    assignment.isActive = false;

    await assignment.save();
  }
}

export default new AssignmentService();
