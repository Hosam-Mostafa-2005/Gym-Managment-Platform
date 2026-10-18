import Workout from "../models/Workout.model.js";
import Exercise from "../models/Exercise.model.js";

import AppError from "../utils/AppError.js";

import type {
  CreateWorkoutDto,
  UpdateWorkoutDto,
} from "../types/workout.types.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import type { ParsedQs } from "qs";
import mapWorkout from "../mappers/workout.mapper.js";
import { Roles, type Role } from "../constants/roles.js";

import { Assignment } from "../models/Assignment.model.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

class WorkoutService {
  async create(data: CreateWorkoutDto, trainerId: string) {
    const existingWorkout = await Workout.findOne({
      title: data.title,
      isActive: true,
    });

    if (existingWorkout) {
      throw new AppError("Workout already exists.", 409);
    }

    const exerciseIds = data.exercises.map((exercise) => exercise.exercise);

    const uniqueExercises = new Set(exerciseIds.map(String));

    if (uniqueExercises.size !== exerciseIds.length) {
      throw new AppError("Duplicate exercises are not allowed.", 400);
    }

    const orders = data.exercises.map((e) => e.order).sort((a, b) => a - b);

    const validOrder = orders.every((value, index) => value === index + 1);

    if (!validOrder) {
      throw new AppError(
        "Exercise order must start from 1 without gaps or duplicates.",
        400,
      );
    }

    const existingExercises = await Exercise.find({
      _id: { $in: exerciseIds },
      isActive: true,
    });
    if (existingExercises.length !== exerciseIds.length) {
      throw new AppError("One or more exercises do not exist.", 400);
    }

    const workout = await Workout.create({
      ...data,
      createdBy: trainerId,
    });
    return workout;
  }

  async getAll(query: ParsedQs, userId: string, role: Role) {
    let filter;
    if (role === Roles.ADMIN) {
      filter = {
        isActive: true,
      };
    } else {
      filter = {
        isActive: true,
        createdBy: userId,
      };
    }

    const allowedFilters =
      role === Roles.ADMIN
        ? ["category", "difficulty", "isTemplate", "tags", "createdBy"]
        : ["category", "difficulty", "isTemplate", "tags"];

    const features = new ApiFeatures(Workout.find(filter).lean(), query)
      .filter(allowedFilters)
      .search(["title", "description", "tags"])
      .sort()
      .paginate();

    const workouts = await features.query;

    return workouts.map(mapWorkout);
  }

  async getById(id: string, userId?: string, role?: Role) {
    const workout = await Workout.findOne({
      _id: id,
      isActive: true,
    })
      .populate("createdBy", "name email role")
      .populate("exercises.exercise");

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    if (userId && role && role !== Roles.ADMIN) {
      const creatorId =
        (workout.createdBy as any)?._id?.toString() ??
        workout.createdBy?.toString();

      if (role === Roles.TRAINER) {
        if (creatorId !== userId && !workout.isTemplate) {
          throw new AppError(
            "You are not allowed to access this workout.",
            403,
          );
        }
      } else if (role === Roles.MEMBER) {
        const isAssigned = await Assignment.exists({
          workout: workout._id,
          member: userId,
          isActive: true,
        });

        if (!isAssigned && !workout.isTemplate) {
          throw new AppError(
            "You are not allowed to access this workout.",
            403,
          );
        }
      }
    }

    // ✅ Explicitly sort the embedded array by 'order' before returning
    if (workout.exercises && workout.exercises.length > 0) {
      workout.exercises.sort((a, b) => a.order - b.order);
    }

    const workoutObj =
      typeof (workout as any).toObject === "function"
        ? (workout as any).toObject()
        : workout;

    return {
      ...workoutObj,
      id: workoutObj._id ?? workoutObj.id,
      createdBy:
        workoutObj.createdBy && typeof workoutObj.createdBy === "object"
          ? {
              ...workoutObj.createdBy,
              id: workoutObj.createdBy._id ?? workoutObj.createdBy.id,
            }
          : workoutObj.createdBy,
      exercises: Array.isArray(workoutObj.exercises)
        ? workoutObj.exercises.map((item: any) => ({
            ...item,
            exercise:
              item.exercise && typeof item.exercise === "object"
                ? {
                    ...item.exercise,
                    id: item.exercise._id ?? item.exercise.id,
                  }
                : item.exercise,
          }))
        : [],
    };
  }

  async update(id: string, data: UpdateWorkoutDto, userId: string, role: Role) {
    const workout = await Workout.findOne({
      _id: id,
      isActive: true,
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    if (role !== Roles.ADMIN && workout.createdBy.toString() !== userId) {
      throw new AppError("You are not allowed to access this workout.", 403);
    }

    if (data.exercises) {
      const exerciseIds = data.exercises.map((exercise) => exercise.exercise);

      const uniqueExercises = new Set(exerciseIds.map(String));

      if (uniqueExercises.size !== exerciseIds.length) {
        throw new AppError("Duplicate exercises are not allowed.", 400);
      }

      const orders = data.exercises.map((e) => e.order).sort((a, b) => a - b);

      const validOrder = orders.every((value, index) => value === index + 1);

      if (!validOrder) {
        throw new AppError(
          "Exercise order must start from 1 without gaps or duplicates.",
          400,
        );
      }

      const existingExercises = await Exercise.find({
        _id: { $in: exerciseIds },
        isActive: true,
      });

      if (existingExercises.length !== exerciseIds.length) {
        throw new AppError("One or more exercises do not exist.", 400);
      }
    }

    if (data.title) {
      const existingWorkout = await Workout.findOne({
        title: data.title,
        isActive: true,
        _id: { $ne: id },
      });

      if (existingWorkout) {
        throw new AppError("Workout already exists.", 409);
      }
    }

    Object.assign(workout, data);

    await workout.save();

    // ✅ Sort before returning the updated document
    if (workout.exercises && workout.exercises.length > 0) {
      workout.exercises.sort((a, b) => a.order - b.order);
    }

    return workout;
  }

  async delete(id: string, userId: string, role: Role) {
    const workout = await Workout.findOne({
      _id: id,
      isActive: true,
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    if (role !== Roles.ADMIN && workout.createdBy.toString() !== userId) {
      throw new AppError("You are not allowed to access this workout.", 403);
    }

    const activeAssignment = await Assignment.findOne({
      workout: id,
      status: ASSIGNMENT_STATUS.ACTIVE,
      isActive: true,
    });

    if (activeAssignment) {
      throw new AppError(
        "Cannot delete a workout that is assigned to members.",
        409,
      );
    }
    workout.isActive = false;

    await workout.save();
  }
}

export default new WorkoutService();
