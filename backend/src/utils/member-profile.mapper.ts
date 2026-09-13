// src/mappers/member-profile.mapper.ts

interface MemberProfileMapperInput {
  member: any;
  currentAssignment: any;
  assignmentHistory: any[];
  measurements: any[];
  workoutStats: any;
  recentSessions: any[];
  timeline: any[];
}

export const mapMemberProfile = ({
  member,
  currentAssignment,
  assignmentHistory,
  measurements,
  workoutStats,
  recentSessions,
  timeline,
}: MemberProfileMapperInput) => {
  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  return {
    member: {
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt,
      isActive: member.isActive,
    },

    overview: {
      currentAssignment: currentAssignment
        ? {
            id: currentAssignment._id.toString(),
            workout: currentAssignment.workout
              ? {
                  id: currentAssignment.workout._id.toString(),
                  title: currentAssignment.workout.title,
                }
              : null,
            trainer: currentAssignment.trainer
              ? {
                  id: currentAssignment.trainer._id.toString(),
                  name: currentAssignment.trainer.name,
                }
              : null,
            startDate: currentAssignment.startDate,
            endDate: currentAssignment.endDate,
            status: currentAssignment.status,
          }
        : null,
      latestMeasurement: latestMeasurement
        ? {
            id: latestMeasurement._id.toString(),
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

    assignmentHistory: assignmentHistory.map((a: any) => ({
      id: a._id.toString(),
      workout: a.workout
        ? {
            id: a.workout._id.toString(),
            title: a.workout.title,
          }
        : null,
      trainer: a.trainer
        ? {
            id: a.trainer._id.toString(),
            name: a.trainer.name,
          }
        : null,
      status: a.status,
      startDate: a.startDate,
      endDate: a.endDate,
      createdAt: a.createdAt,
    })),

    measurementHistory: measurements.slice(0, 10).map((m: any) => ({
      id: m._id.toString(),
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
      id: s._id.toString(),
      workout: s.assignment?.workout
        ? {
            id: s.assignment.workout._id.toString(),
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
