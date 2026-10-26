import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

class WorkoutExerciseLogService {
  async getBySession(sessionId: string, memberId: string) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        memberId,
        isActive: true,
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const exercises = await prisma.workoutExerciseLog.findMany({
      where: {
        sessionId,
      },
      include: {
        exercise: true,
        sets: {
          orderBy: { setNumber: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return exercises;
  }
}

export default new WorkoutExerciseLogService();
