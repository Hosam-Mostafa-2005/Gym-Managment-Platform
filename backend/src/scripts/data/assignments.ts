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

  return members.map((member, index) => {
    const trainer = trainers[index % trainers.length];
    const workout = workouts[index % workouts.length];

    // Start date between 1 and 30 days ago
    const startDate = new Date();
    startDate.setDate(now.getDate() - (((index * 2) % 30) + 1));

    // End date 30 days after start
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);

    return {
      member: member._id,
      trainer: trainer._id,
      workout: workout._id,
      startDate,
      endDate,
      status: ASSIGNMENT_STATUS.ACTIVE,
      notes: `Customized training regimen assigned by Coach ${trainer.name}. Focus on progressive overload.`,
    };
  });
};
