import Exercise from "../models/Exercise.model.js";
import Workout from "../models/Workout.model.js";
import type {
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../types/exercise.types.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";
import mapExercise from "../mappers/exercise.mapper.js";

class ExerciseService {
  // Create Exercise
  async create(data: CreateExerciseDto) {
    const existingExercise = await Exercise.findOne({
      name: data.name,
      isActive: true,
    });

    if (existingExercise) {
      throw new AppError("Exercise already exists.", 409);
    }
    if (data.alternatives?.length) {
      const alternatives = await Exercise.countDocuments({
        _id: { $in: data.alternatives },
        isActive: true,
      });

      if (alternatives !== data.alternatives.length) {
        throw new AppError(
          "One or more alternative exercises are invalid.",
          400,
        );
      }
    }

    const exercise = await Exercise.create(data);

    return mapExercise(exercise);
  }

  // Get All Exercises with Pagination Metadata
  async getAll(query: Record<string, any>) {
    // 1. Get the total count matching the active filter criteria
    const totalResults = await Exercise.countDocuments({ isActive: true });

    // 2. Setup ApiFeatures for filtering, searching, sorting, and pagination
    const features = new ApiFeatures(Exercise.find({ isActive: true }), query)
      .filter()
      .search(["name", "primaryMuscles", "secondaryMuscles"])
      .sort()
      .paginate();

    const exercises = await features.query;

    return {
      exercises: exercises.map(mapExercise),
      totalResults,
    };
  }

  // Get Exercise By Id
  async getById(id: string) {
    const exercise = await Exercise.findOne({
      _id: id,
      isActive: true,
    }).populate("alternatives");

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    return exercise;
  }

  // Update Exercise
  async update(id: string, data: UpdateExerciseDto) {
    const exercise = await Exercise.findOne({
      _id: id,
      isActive: true,
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    if (data.name) {
      const existingExercise = await Exercise.findOne({
        name: data.name,
        isActive: true,
        _id: { $ne: id },
      });

      if (existingExercise) {
        throw new AppError("Exercise already exists.", 409);
      }
    }
    if (data.alternatives?.length) {
      const alternatives = await Exercise.countDocuments({
        _id: { $in: data.alternatives },
        isActive: true,
      });

      if (alternatives !== data.alternatives.length) {
        throw new AppError(
          "One or more alternative exercises are invalid.",
          400,
        );
      }
    }
    Object.assign(exercise, data);

    await exercise.save();

    return exercise;
  }

  // Soft Delete
  async delete(id: string) {
    const exercise = await Exercise.findOne({
      _id: id,
      isActive: true,
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    const usedInWorkout = await Workout.findOne({
      isActive: true,
      "exercises.exercise": exercise._id,
    });

    if (usedInWorkout) {
      throw new AppError(
        "Cannot delete an exercise that is used in a workout.",
        409,
      );
    }

    exercise.isActive = false;

    await exercise.save();
    return;
  }
}

export default new ExerciseService();
