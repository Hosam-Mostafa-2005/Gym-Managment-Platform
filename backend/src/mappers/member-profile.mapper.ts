// src/mappers/member-profile.mapper.ts

interface MemberProfileMapperInput {
  member: any;
  currentAssignment: any;
  activeAssignments?: any[];
  assignmentHistory: any[];
  measurements: any[];
  workoutStats: any;
  recentSessions: any[];
  timeline: any[];
  coachingRelationship?: any;
  historicalSessions?: any[];
  currentCoachSessions?: any[];
  historicalMeasurements?: any[];
  currentCoachMeasurements?: any[];
  historicalStats?: any;
  currentCoachStats?: any;
  weightComparison?: any;
  canAccessHistory?: boolean;
}

export const mapMemberProfile = ({
  member,
  currentAssignment,
  activeAssignments = [],
  assignmentHistory,
  measurements,
  workoutStats,
  recentSessions,
  timeline,
  coachingRelationship,
  historicalSessions = [],
  currentCoachSessions = [],
  historicalMeasurements = [],
  currentCoachMeasurements = [],
  historicalStats = null,
  currentCoachStats = null,
  weightComparison = null,
  canAccessHistory = true,
}: MemberProfileMapperInput) => {
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  return {
    member: {
      id: member.id ?? member._id?.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone ?? null,
      bio: member.bio ?? null,
      fitnessGoal: member.fitnessGoal ?? null,
      experienceLevel: member.experienceLevel ?? null,
      createdAt: member.createdAt,
      isActive: member.isActive,
    },

    overview: {
      currentAssignment: currentAssignment
        ? {
            id: currentAssignment.id ?? currentAssignment._id?.toString(),
            workout: currentAssignment.workout
              ? {
                  id:
                    currentAssignment.workout.id ??
                    currentAssignment.workout._id?.toString(),
                  title: currentAssignment.workout.title,
                }
              : null,
            trainer: currentAssignment.trainer
              ? {
                  id:
                    currentAssignment.trainer.id ??
                    currentAssignment.trainer._id?.toString(),
                  name: currentAssignment.trainer.name,
                }
              : null,
            startDate: currentAssignment.startDate,
            endDate: currentAssignment.endDate,
            status: currentAssignment.status,
          }
        : null,
      activeAssignments: (
        activeAssignments.length > 0
          ? activeAssignments
          : currentAssignment
            ? [currentAssignment]
            : []
      ).map((a: any) => ({
        id: a.id ?? a._id?.toString(),
        workout: a.workout
          ? {
              id: a.workout.id ?? a.workout._id?.toString(),
              title: a.workout.title,
              category: a.workout.category,
              difficulty: a.workout.difficulty,
            }
          : null,
        trainer: a.trainer
          ? {
              id: a.trainer.id ?? a.trainer._id?.toString(),
              name: a.trainer.name,
            }
          : null,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
      })),
      latestMeasurement: latestMeasurement
        ? {
            id: latestMeasurement.id ?? latestMeasurement._id?.toString(),
            weight: latestMeasurement.weight,
            height: latestMeasurement.height,
            bodyFat: latestMeasurement.bodyFat,
            circumferences: latestMeasurement.circumferences,
            notes: latestMeasurement.notes,
            measuredAt: latestMeasurement.measuredAt,
            createdAt: latestMeasurement.createdAt,
            updatedAt: latestMeasurement.updatedAt,
          }
        : null,
      workoutStats: {
        totalSessions: workoutStats?.totalSessions || 0,
        completedSessions: workoutStats?.completedSessions || 0,
        completionRate:
          workoutStats?.totalSessions > 0
            ? Math.round(
                (workoutStats.completedSessions / workoutStats.totalSessions) *
                  100,
              )
            : 0,
        averageWorkoutDuration:
          workoutStats?.completedSessions > 0
            ? Math.round(
                workoutStats.totalDuration / workoutStats.completedSessions,
              )
            : 0,
        totalWorkoutVolume: workoutStats?.totalVolume || 0,
      },
    },

    coachingRelationship: coachingRelationship
      ? {
          id: coachingRelationship.id,
          trainerId: coachingRelationship.trainerId,
          memberId: coachingRelationship.memberId,
          status: coachingRelationship.status,
          historySharingConsent: coachingRelationship.historySharingConsent,
          historyConsentAt: coachingRelationship.historyConsentAt,
          startedAt: coachingRelationship.startedAt,
          trainer: coachingRelationship.trainer || null,
          canAccessHistory,
        }
      : null,

    historicalProgress: {
      isShared: canAccessHistory,
      stats: historicalStats,
      sessions: historicalSessions.map((s: any) => ({
        id: s.id ?? s._id?.toString(),
        workout: s.workout
          ? {
              id: s.workout.id ?? s.workout._id?.toString(),
              title: s.workout.title,
            }
          : s.assignment?.workout
          ? {
              id: s.assignment.workout.id ?? s.assignment.workout._id?.toString(),
              title: s.assignment.workout.title,
            }
          : null,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        duration: s.duration,
        totalVolume: s.totalVolume,
        isHistorical: true,
      })),
      measurements: historicalMeasurements.map((m: any) => ({
        id: m.id ?? m._id?.toString(),
        weight: m.weight,
        height: m.height,
        bodyFat: m.bodyFat,
        measuredAt: m.measuredAt,
        isHistorical: true,
      })),
    },

    currentCoachProgress: {
      stats: currentCoachStats,
      weightComparison,
      sessions: currentCoachSessions.map((s: any) => ({
        id: s.id ?? s._id?.toString(),
        workout: s.workout
          ? {
              id: s.workout.id ?? s.workout._id?.toString(),
              title: s.workout.title,
            }
          : s.assignment?.workout
          ? {
              id: s.assignment.workout.id ?? s.assignment.workout._id?.toString(),
              title: s.assignment.workout.title,
            }
          : null,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        duration: s.duration,
        totalVolume: s.totalVolume,
        isHistorical: false,
      })),
      measurements: currentCoachMeasurements.map((m: any) => ({
        id: m.id ?? m._id?.toString(),
        weight: m.weight,
        height: m.height,
        bodyFat: m.bodyFat,
        measuredAt: m.measuredAt,
        isHistorical: false,
      })),
    },

    assignmentHistory: assignmentHistory.map((a: any) => ({
      id: a.id ?? a._id?.toString(),
      workout: a.workout
        ? {
            id: a.workout.id ?? a.workout._id?.toString(),
            title: a.workout.title,
          }
        : null,
      trainer: a.trainer
        ? {
            id: a.trainer.id ?? a.trainer._id?.toString(),
            name: a.trainer.name,
          }
        : null,
      status: a.status,
      startDate: a.startDate,
      endDate: a.endDate,
      createdAt: a.createdAt,
    })),

    measurementHistory: measurements.slice(0, 10).map((m: any) => ({
      id: m.id ?? m._id?.toString(),
      weight: m.weight,
      height: m.height,
      bodyFat: m.bodyFat,
      circumferences: m.circumferences,
      notes: m.notes,
      measuredAt: m.measuredAt,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),

    recentSessions: recentSessions.slice(0, 5).map((s: any) => ({
      id: s.id ?? s._id?.toString(),
      workout: s.workout
        ? {
            id: s.workout.id ?? s.workout._id?.toString(),
            title: s.workout.title,
          }
        : s.assignment?.workout
        ? {
            id: s.assignment.workout.id ?? s.assignment.workout._id?.toString(),
            title: s.assignment.workout.title,
          }
        : null,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      duration: s.duration,
    })),

    timeline: timeline.slice(0, 20),
  };
};

export default mapMemberProfile;
