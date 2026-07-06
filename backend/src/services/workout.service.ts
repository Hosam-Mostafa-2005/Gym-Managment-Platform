import Workout from "../models/Workout.model.js";
import Exercise from "../models/Exercise.model.js";

import AppError from "../utils/AppError.js";

import type {
  CreateWorkoutDto,
  UpdateWorkoutDto,
} from "../types/workout.types.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import type { ParsedQs } from "qs";
import mapWorkout from "../utils/workout.mapper.js";

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

  async getAll(query: ParsedQs) {
    const features = new ApiFeatures(Workout.find({ isActive: true }), query)
      .filter()
      .search(["title", "description", "tags"])
      .sort()
      .paginate();

    const workouts = await features.query;

    return workouts.map(mapWorkout);
  }

  async getById(id: string) {
    const workout = await Workout.findOne({
      _id: id,
      isActive: true,
    })
      .populate("createdBy")
      .populate("exercises.exercise");

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    return workout;
  }

  async update(id: string, data: UpdateWorkoutDto) {
    const workout = await Workout.findOne({
      _id: id,
      isActive: true,
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    if (data.exercises) {
      const exerciseIds = data.exercises.map((exercise) => exercise.exercise);

      const existingExercises = await Exercise.find({
        _id: { $in: exerciseIds },
        isActive: true,
      });

      if (existingExercises.length !== exerciseIds.length) {
        throw new AppError("One or more exercises do not exist.", 400);
      }
    }

    Object.assign(workout, data);

    await workout.save();

    return workout;
  }

  async delete(id: string) {
    const workout = await Workout.findOne({
      _id: id,
      isActive: true,
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    workout.isActive = false;

    await workout.save();
  }
}

export default new WorkoutService();
