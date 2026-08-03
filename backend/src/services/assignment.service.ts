import type { ParsedQs } from "qs";

import { Assignment } from "../models/Assignment.model.js";
import Workout from "../models/Workout.model.js";
import User from "../models/User.model.js";

import AppError from "../utils/AppError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

import { Roles } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

import mapAssignment from "../utils/assignment.mapper.js";

import type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from "../types/assignment.types.js";

class AssignmentService {
  async create(data: CreateAssignmentDto) {
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
    const workout = await Workout.findOne({
      _id: data.workout,
      isActive: true,
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    const existingAssignment = await Assignment.findOne({
      member: data.member,
      workout: data.workout,
      status: ASSIGNMENT_STATUS.ACTIVE,
      isActive: true,
    });

    if (existingAssignment) {
      throw new AppError(
        "This workout is already assigned to this member.",
        409,
      );
    }

    const assignment = await Assignment.create(data);

    return mapAssignment(assignment);
  }

  async getAll(query: ParsedQs) {
    const features = new ApiFeatures(
      Assignment.find({ isActive: true })
        .populate("member", "name email")
        .populate("trainer", "name email")
        .populate("workout", "title"),
      query,
    )
      .filter()
      .sort()
      .paginate();

    const total = await Assignment.countDocuments({
      isActive: true,
    });

    const active = await Assignment.countDocuments({
      isActive: true,
      status: ASSIGNMENT_STATUS.ACTIVE,
    });

    const completed = await Assignment.countDocuments({
      isActive: true,
      status: ASSIGNMENT_STATUS.COMPLETED,
    });

    const cancelled = await Assignment.countDocuments({
      isActive: true,
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

  async getById(id: string) {
    const assignment = await Assignment.findOne({
      _id: id,
      isActive: true,
    })
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
      .populate("trainer", "name email")
      .populate("workout");
  }

  async update(id: string, data: UpdateAssignmentDto) {
    const assignment = await Assignment.findOne({
      _id: id,
      isActive: true,
    });

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

    if (data.workout) {
      const workout = await Workout.findOne({
        _id: data.workout,
        isActive: true,
      });

      if (!workout) {
        throw new AppError("Workout not found.", 404);
      }
    }

    Object.assign(assignment, data);

    await assignment.save();

    return mapAssignment(assignment);
  }

  async delete(id: string) {
    const assignment = await Assignment.findOne({
      _id: id,
      isActive: true,
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    assignment.isActive = false;

    await assignment.save();
  }
}

export default new AssignmentService();
