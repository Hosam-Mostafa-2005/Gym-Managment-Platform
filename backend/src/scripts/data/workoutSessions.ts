import { WORKOUT_SESSION_STATUS } from "../../constants/workout-session.js";

export interface RawWorkoutSession {
  assignment: any; // ObjectId
  member: any; // ObjectId
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  status: (typeof WORKOUT_SESSION_STATUS)[keyof typeof WORKOUT_SESSION_STATUS];
  notes?: string;
}

export const generateWorkoutSessionsData = (
  assignments: any[],
): RawWorkoutSession[] => {
  const sessions: RawWorkoutSession[] = [];
  const now = new Date();

  assignments.forEach((assignment, index) => {
    // 1st Session: COMPLETED (3 days ago)
    const start1 = new Date();
    start1.setDate(now.getDate() - 3);
    start1.setHours(10, 0, 0, 0);

    const end1 = new Date(start1);
    end1.setMinutes(start1.getMinutes() + 55);

    sessions.push({
      assignment: assignment._id,
      member: assignment.member,
      startedAt: start1,
      endedAt: end1,
      duration: 55,
      status: WORKOUT_SESSION_STATUS.COMPLETED,
      notes:
        "Felt strong throughout the entire workout. Hit target reps on primary lifts.",
    });

    // 2nd Session: Varying status
    if (index % 3 === 0) {
      const start2 = new Date();
      start2.setMinutes(now.getMinutes() - 30);

      sessions.push({
        assignment: assignment._id,
        member: assignment.member,
        startedAt: start2,
        status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
        notes: "Currently working through accessory movements.",
      });
    } else {
      const start2 = new Date();
      start2.setDate(now.getDate() - 1);
      start2.setHours(17, 30, 0, 0);

      const end2 = new Date(start2);
      end2.setMinutes(start2.getMinutes() + 65);

      sessions.push({
        assignment: assignment._id,
        member: assignment.member,
        startedAt: start2,
        endedAt: end2,
        duration: 65,
        status: WORKOUT_SESSION_STATUS.COMPLETED,
        notes:
          "Challenging session. Needed a spotter on the final set of presses.",
      });
    }
  });

  return sessions;
};
