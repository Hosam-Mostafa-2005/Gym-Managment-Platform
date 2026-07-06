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
        .populate("workout", "title"),
      query,
    )
      .filter()
      .sort()
      .paginate();

    const assignments = await features.query;

    return assignments.map(mapAssignment);
  }

  async getById(id: string) {
    const assignment = await Assignment.findOne({
      _id: id,
      isActive: true,
    })
      .populate("member", "name email role")
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
    }).populate("workout");
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
