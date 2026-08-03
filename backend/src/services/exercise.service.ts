import Exercise from "../models/Exercise.model.js";
import type {
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../types/exercise.types.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";
import mapExercise from "../utils/exercise.mapper.js";

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

    exercise.isActive = false;

    await exercise.save();
    return;
  }
}

export default new ExerciseService();
