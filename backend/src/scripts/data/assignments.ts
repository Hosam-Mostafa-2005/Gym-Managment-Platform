import { ASSIGNMENT_STATUS } from "../../constants/assignment.js";

export interface RawAssignment {
  member: any; // ObjectId
  trainer: any; // ObjectId
  workout: any; // ObjectId
  startDate: Date;
  endDate: Date;
  status: (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];
  notes?: string;
}

export const generateAssignmentsData = (
  members: any[],
  trainers: any[],
  workouts: any[],
): RawAssignment[] => {
  const now = new Date();

  const noteVariations = [
    "Focus on progressive overload.",
    "Prioritize movement quality.",
    "Increase training volume gradually.",
    "Improve overall conditioning.",
    "Maintain strict exercise technique.",
    "Build consistency before increasing intensity.",
    "Recovery is a priority this cycle.",
  ];

  return members.map((member, index) => {
    const trainer = trainers[index % trainers.length];
    const workout = workouts[index % workouts.length];

    const noteIndex = index % noteVariations.length;
    const selectedNote = noteVariations[noteIndex];
    const notes = `Customized training regimen assigned by Coach ${trainer.name}. ${selectedNote}`;

    const remainder = index % 100;
    const startDate = new Date(now);
    const endDate = new Date(now);
    let status: (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

    // Target distribution: ~60% ACTIVE, ~25% COMPLETED, ~15% CANCELLED
    if (remainder < 60) {
      status = ASSIGNMENT_STATUS.ACTIVE;

      // Create specific dashboard scenarios for Upcoming Assignments
      if (remainder === 0) {
        // Ends tomorrow (1 day remaining)
        startDate.setDate(now.getDate() - 20);
        endDate.setDate(now.getDate() + 1);
      } else if (remainder === 1) {
        // Ends in 2 days
        startDate.setDate(now.getDate() - 22);
        endDate.setDate(now.getDate() + 2);
      } else if (remainder === 2) {
        // Ends in 3 days
        startDate.setDate(now.getDate() - 25);
        endDate.setDate(now.getDate() + 3);
      } else {
        // Others have 20-30 days remaining (started 5-25 days ago, end 5-30 days in future)
        const daysAgo = (index % 21) + 5; // 5 to 25 days ago
        const daysAhead = (index % 26) + 5; // 5 to 30 days in future
        startDate.setDate(now.getDate() - daysAgo);
        endDate.setDate(now.getDate() + daysAhead);
      }
    } else if (remainder < 85) {
      status = ASSIGNMENT_STATUS.COMPLETED;
      // COMPLETED assignments: started 60-120 days ago, ended 10-40 days ago
      const daysAgoStart = (index % 61) + 60; // 60 to 120 days ago
      const daysAgoEnd = (index % 31) + 10; // 10 to 40 days ago
      startDate.setDate(now.getDate() - daysAgoStart);
      endDate.setDate(now.getDate() - daysAgoEnd);
    } else {
      status = ASSIGNMENT_STATUS.CANCELLED;
      // CANCELLED assignments: started 20-60 days ago, ended before today
      const daysAgoStart = (index % 41) + 20; // 20 to 60 days ago
      const daysAgoEnd = (index % 15) + 1; // 1 to 15 days ago (before today)
      startDate.setDate(now.getDate() - daysAgoStart);
      endDate.setDate(now.getDate() - daysAgoEnd);
    }

    return {
      member: member._id,
      trainer: trainer._id,
      workout: workout._id,
      startDate,
      endDate,
      status,
      notes,
    };
  });
};
