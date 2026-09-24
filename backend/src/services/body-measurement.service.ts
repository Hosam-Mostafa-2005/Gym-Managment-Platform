// src/services/body-measurement.service.ts
import BodyMeasurement from "../models/BodyMeasurement.model.js";
import User from "../models/User.model.js";
import { Assignment } from "../models/Assignment.model.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { mapBodyMeasurement } from "../mappers/body-measurement.mapper.js";
import type {
  CreateBodyMeasurementDto,
  UpdateBodyMeasurementDto,
} from "../types/body-measurement.types.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

class BodyMeasurementService {
  private async checkTrainerAccess(trainerId: string, memberId: string) {
    const isAssigned = await Assignment.exists({
      trainer: trainerId,
      member: memberId,
      isActive: true,
      status: ASSIGNMENT_STATUS.ACTIVE,
    });
    if (!isAssigned) {
      throw new AppError("Member is not assigned to you.", 403);
    }
  }

  async create(data: CreateBodyMeasurementDto, userId: string, role: Role) {
    const member = await User.findById(data.member);
    if (!member || !member.isActive) {
      throw new AppError("Member not found.", 404);
    }
    if (member.role !== Roles.MEMBER) {
      throw new AppError("Selected user is not a member.", 400);
    }

    if (role === Roles.TRAINER) {
      if (data.trainer.toString() !== userId) {
        throw new AppError(
          "Trainers can only create measurements under their own ID.",
          403,
        );
      }
      await this.checkTrainerAccess(userId, data.member.toString());
    }
    const trainer = await User.findById(data.trainer);

    if (!trainer) {
      throw new AppError("Trainer not found.", 404);
    }

    if (role !== Roles.ADMIN && trainer.role !== Roles.TRAINER) {
      throw new AppError("Trainer not found.", 404);
    }
    const measurement = await BodyMeasurement.create(data);
    await notificationService.create({
      user: member._id,
      title: "New Body Measurement",
      message: "Your trainer recorded a new body measurement.",
      type: NOTIFICATION_TYPE.BODY_MEASUREMENT_CREATED,
      actionUrl: `/body-measurements/${measurement.id}`,
      metadata: {
        measurementId: measurement.id,
      },
    });
    return mapBodyMeasurement(measurement);
  }

  async getAllByMember(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER && userId !== memberId) {
      throw new AppError("You can only view your own measurements.", 403);
    }
    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, memberId);
    }

    const measurements = await BodyMeasurement.find({
      member: memberId,
      isActive: true,
    })
      .populate("trainer", "name")
      .sort({ measuredAt: -1 });

    return measurements.map(mapBodyMeasurement);
  }

  async getLatest(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER && userId !== memberId) {
      throw new AppError("You can only view your own measurements.", 403);
    }
    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, memberId);
    }

    const measurement = await BodyMeasurement.findOne({
      member: memberId,
      isActive: true,
    })
      .populate("trainer", "name")
      .sort({ measuredAt: -1 });

    if (!measurement) {
      throw new AppError("No measurements found for this member.", 404);
    }

    return mapBodyMeasurement(measurement);
  }

  async getById(id: string, userId: string, role: Role) {
    const measurement = await BodyMeasurement.findOne({
      _id: id,
      isActive: true,
    }).populate("trainer", "name");

    if (!measurement) {
      throw new AppError("Body measurement not found.", 404);
    }

    if (role === Roles.MEMBER && measurement.member.toString() !== userId) {
      throw new AppError("You can only view your own measurements.", 403);
    }
    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, measurement.member.toString());
    }

    return mapBodyMeasurement(measurement);
  }

  async update(
    id: string,
    data: UpdateBodyMeasurementDto,
    userId: string,
    role: Role,
  ) {
    const measurement = await BodyMeasurement.findOne({
      _id: id,
      isActive: true,
    });

    if (!measurement) {
      throw new AppError("Body measurement not found.", 404);
    }

    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, measurement.member.toString());
    }

    Object.assign(measurement, data);

    await measurement.save();

    await notificationService.create({
      user: measurement.member,
      title: "Body Measurement Updated",
      message: "Your body measurement has been updated.",
      type: NOTIFICATION_TYPE.BODY_MEASUREMENT_UPDATED,
      actionUrl: `/body-measurements/${measurement.id}`,
      metadata: {
        measurementId: measurement.id,
      },
    });

    return mapBodyMeasurement(measurement);
  }

  async delete(id: string, userId: string, role: Role) {
    const measurement = await BodyMeasurement.findOne({
      _id: id,
      isActive: true,
    });

    if (!measurement) {
      throw new AppError("Body measurement not found.", 404);
    }

    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, measurement.member.toString());
    }

    measurement.isActive = false;
    await measurement.save();
  }
}

export default new BodyMeasurementService();
