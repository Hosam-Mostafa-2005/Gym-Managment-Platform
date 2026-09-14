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

  const noteVariations = [
    "Excellent technique today.",
    "Great consistency.",
    "Increased training volume.",
    "Improved squat depth.",
    "Recovery was slower than expected.",
    "Reduced rest between sets.",
    "Good intensity.",
    "Strong performance today.",
    "Energy levels were lower today.",
    "Focused on movement quality.",
  ];

  const trainingHours = [7.5, 9, 11, 16.5, 18, 20];

  assignments.forEach((assignment, index) => {
    // Determine personality based on index to ensure varied frequency
    // Personality types: 0 = Dedicated (4-5 sessions/week), 1 = Average (2-3 sessions/week), 2 = Inactive (1 session every 10-14 days with recent gap)
    const personalityType = index % 3;

    // Determine number of total sessions for this assignment (between 12 and 35)
    // Dedicated: ~28-35, Average: ~18-25, Inactive: ~12-16
    let targetSessionCount = 12 + (index % 24);
    if (personalityType === 0) {
      targetSessionCount = 28 + (index % 8); // 28 to 35
    } else if (personalityType === 1) {
      targetSessionCount = 18 + (index % 8); // 18 to 25
    } else {
      targetSessionCount = 12 + (index % 5); // 12 to 16
    }

    // Days interval calculation based on personality over a 90-day window
    let dayStep = 90 / targetSessionCount;
    if (personalityType === 0) {
      dayStep = 2.0; // ~4-5 sessions per week
    } else if (personalityType === 1) {
      dayStep = 3.5; // ~2-3 sessions per week
    } else {
      dayStep = 7.0; // ~1 session every week, but we will inject a large gap at the end for inactivity scenario
    }

    // Generate sessions spanning backward from 90 days ago up to now
    let currentDayOffset = 90;
    let sessionCounter = 0;

    while (currentDayOffset > 0 && sessionCounter < targetSessionCount) {
      // For inactive members, create a gap of 15 to 25 days with no workouts right before "now"
      if (personalityType === 2 && currentDayOffset < 22) {
        currentDayOffset -= 3;
        continue;
      }

      const startedAt = new Date(now);
      startedAt.setDate(now.getDate() - Math.round(currentDayOffset));

      // Randomize hour and minute from predefined training hours
      const hourDecimal =
        trainingHours[(index + sessionCounter) % trainingHours.length];
      const hour = Math.floor(hourDecimal);
      const minute = hourDecimal % 1 !== 0 ? 30 : 0;
      startedAt.setHours(hour, minute, 0, 0);

      // Do not generate future sessions beyond current time
      if (startedAt <= now) {
        // Determine status: ~75% COMPLETED, ~15% IN_PROGRESS (only for very recent/today sessions), ~10% other or completed fallback
        const statusRoll = (index + sessionCounter) % 100;
        let status: RawWorkoutSession["status"] =
          WORKOUT_SESSION_STATUS.COMPLETED;
        // Allow IN_PROGRESS for a small subset if it's very close to 'now' (e.g. today or last index check)
        if (statusRoll < 15 && currentDayOffset < 1 && index % 4 === 0) {
          status = WORKOUT_SESSION_STATUS.IN_PROGRESS;
        }

        if (status === WORKOUT_SESSION_STATUS.IN_PROGRESS) {
          sessions.push({
            assignment: assignment._id,
            member: assignment.member,
            startedAt,
            status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
            notes: "Currently working through accessory movements.",
          });
        } else {
          // COMPLETED session: duration 35–95 minutes
          const duration = 35 + ((index + sessionCounter) % 61);
          const endedAt = new Date(startedAt);
          endedAt.setMinutes(startedAt.getMinutes() + duration);

          const note =
            noteVariations[(index + sessionCounter) % noteVariations.length];

          sessions.push({
            assignment: assignment._id,
            member: assignment.member,
            startedAt,
            endedAt,
            duration,
            status: WORKOUT_SESSION_STATUS.COMPLETED,
            notes: note,
          });
        }
      }

      // Advance day offset with some minor variance
      currentDayOffset -= dayStep + (sessionCounter % 3) * 0.4;
      sessionCounter++;
    }
  });

  // Guarantee explicit recent activity for dashboard charts & recent activity feeds (Today, Yesterday, 2 days ago, 3 days ago)
  if (assignments.length > 0) {
    const guaranteeAssignment = assignments[0];
    const offsets = [0, 1, 2, 3]; // Today, Yesterday, 2 days ago, 3 days ago

    offsets.forEach((offset, idx) => {
      const startedAt = new Date(now);
      startedAt.setDate(now.getDate() - offset);
      startedAt.setHours(8 + idx, 30, 0, 0);

      const duration = 45 + idx * 10;
      const endedAt = new Date(startedAt);
      endedAt.setMinutes(startedAt.getMinutes() + duration);

      sessions.push({
        assignment: guaranteeAssignment._id,
        member: guaranteeAssignment.member,
        startedAt,
        endedAt,
        duration,
        status: WORKOUT_SESSION_STATUS.COMPLETED,
        notes: noteVariations[idx % noteVariations.length],
      });
    });
  }

  return sessions;
};
