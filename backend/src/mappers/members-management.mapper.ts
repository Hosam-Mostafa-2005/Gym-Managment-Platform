// src/mappers/members-management.mapper.ts
import type { MemberManagementCard } from "../types/members-management.types.js";

export const mapMemberManagementCard = (data: any): MemberManagementCard => {
  const assignment = data.currentAssignment;
  const trainer = data.trainer;
  const workout = data.workout;
  const memberId = (data.id ?? data._id)?.toString();
  const workoutId = workout ? (workout.id ?? workout._id)?.toString() : null;
  const trainerId = trainer ? (trainer.id ?? trainer._id)?.toString() : null;

  return {
    member: {
      id: memberId,
      name: data.name,
      email: data.email,
      isActive: data.isActive,
      joinedAt: data.createdAt,
    },
    assignment: assignment
      ? {
          status: assignment.status,
          currentWorkout: workout
            ? {
                id: workoutId,
                title: workout.title,
              }
            : null,
          trainer: trainer
            ? {
                id: trainerId,
                name: trainer.name,
              }
            : null,
        }
      : null,
    workout: {
      completionRate: Math.round(data.completionRate || 0),
      lastWorkout: data.lastWorkoutDate || null,
    },
    measurements: {
      latestWeight: data.latestWeight || null,
    },
    relationship: data.relationship
      ? {
          id: data.relationship.id,
          status: data.relationship.status,
          historySharingConsent: data.relationship.historySharingConsent,
          startedAt: data.relationship.startedAt,
        }
      : null,
  };
};

export default mapMemberManagementCard;
