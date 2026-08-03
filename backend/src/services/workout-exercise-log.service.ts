import WorkoutExerciseLog from "../models/WorkoutSession.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";

import AppError from "../utils/AppError.js";

class WorkoutExerciseLogService {
  async getBySession(sessionId: string, memberId: string) {
    const session = await WorkoutSession.findOne({
      _id: sessionId,
      member: memberId,
      isActive: true,
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const exercises = await WorkoutExerciseLog.find({
      session: sessionId,
    }).sort({
      order: 1,
    });

    return exercises;
  }
}

export default new WorkoutExerciseLogService();
