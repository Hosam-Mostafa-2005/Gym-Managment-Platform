import mongoose from "mongoose";
import User from "../models/User.model.js";
import Exercise from "../models/Exercise.model.js";
import Workout from "../models/Workout.model.js";
import { Assignment } from "../models/Assignment.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import WorkoutExerciseLog from "../models/WorkoutExerciseLog.model.js";
import WorkoutSetLog from "../models/WorkoutSetLog.model.js";

import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

// ============================================================================
// HELPER FUNCTIONS FOR TIMELINE ZERO-PADDING & RECHARTS FORMATTING
// ============================================================================

const getPastDates = (days: number) => {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push({
      dateStr: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    });
  }
  return result;
};

const getPastMonths = (months: number) => {
  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }
  return result;
};

const fillDailyData = (dates: any[], aggData: any[], defaultObj: any) => {
  return dates.map((d) => {
    const found = aggData.find((a) => a._id === d.dateStr) || {};
    return { date: d.label, ...defaultObj, ...found };
  });
};

const fillMonthlyData = (months: any[], aggData: any[], defaultObj: any) => {
  return months.map((m) => {
    const found = aggData.find((a) => a._id === m.key) || {};
    return { month: m.label, ...defaultObj, ...found };
  });
};

const chunkIntoWeeks = (dailyData: any[], weeks: number, defaultObj: any) => {
  const result = [];
  for (let i = 0; i < weeks; i++) {
    const chunk = dailyData.slice(i * 7, (i + 1) * 7);
    const sumObj: any = { week: `Week of ${chunk[0].date}` };
    Object.keys(defaultObj).forEach((k) => {
      sumObj[k] = chunk.reduce(
        (acc: number, curr: any) => acc + (curr[k] || 0),
        0,
      );
    });
    result.push(sumObj);
  }
  return result;
};

const fillWeekdays = (aggData: any[]) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day, index) => {
    const found = aggData.find((a) => a._id === index + 1) || { count: 0 };
    return { day, sessions: found.count };
  });
};

const fillHours = (aggData: any[]) => {
  return Array.from({ length: 24 }, (_, i) => {
    const found = aggData.find((a) => a._id === i) || { count: 0 };
    const label =
      i === 0
        ? "12 AM"
        : i < 12
          ? `${i} AM`
          : i === 12
            ? "12 PM"
            : `${i - 12} PM`;
    return { hour: label, sessions: found.count };
  });
};

class DashboardService {
  // ============================================================================
  // TRAINER & ADMIN DASHBOARD
  // ============================================================================
  async getTrainerDashboard(userId: string, role: Role) {
    const isAdmin = role === Roles.ADMIN;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const assignmentMatch = isAdmin
      ? { isActive: true }
      : { trainer: userObjectId, isActive: true };
    const workoutMatch = isAdmin
      ? { isActive: true }
      : { createdBy: userObjectId, isActive: true };

    const assignments =
      await Assignment.find(assignmentMatch).select("_id member");
    const assignmentIds = assignments.map((a) => a._id);
    const memberIds = [...new Set(assignments.map((a) => a.member.toString()))];

    const sessionMatch = isAdmin
      ? { isActive: true }
      : { assignment: { $in: assignmentIds }, isActive: true };

    // Time Boundaries
    const now = new Date();
    const days84Ago = new Date(now);
    days84Ago.setDate(days84Ago.getDate() - 84); // 12 weeks
    const months12Ago = new Date(now);
    months12Ago.setMonth(months12Ago.getMonth() - 12);

    // ============================================================================
    // PARALLEL AGGREGATIONS
    // ============================================================================
    const [
      globalUserStats,
      totalExercises,
      totalWorkouts,
      assignmentsFacet,
      sessionsFacet,
      topMembersByVolume,
      topWorkoutsData,
      topExercisesData,
      recentSessionsRaw,
      recentAssignmentsRaw,
      topTrainersData,
    ] = await Promise.all([
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Exercise.countDocuments({ isActive: true }),
      Workout.countDocuments(workoutMatch),

      // Single pass assignment metrics
      Assignment.aggregate([
        { $match: assignmentMatch },
        {
          $facet: {
            statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            monthlyCreated: [
              { $match: { createdAt: { $gte: months12Ago } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m", date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),

      // Single pass session metrics
      WorkoutSession.aggregate([
        { $match: sessionMatch },
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                        1,
                        0,
                      ],
                    },
                  },
                  active: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$status", WORKOUT_SESSION_STATUS.IN_PROGRESS],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  totalDuration: { $sum: "$duration" },
                  avgDuration: { $avg: "$duration" },
                  totalVolume: { $sum: "$totalVolume" },
                  avgVolume: { $avg: "$totalVolume" },
                  avgExercises: { $avg: "$exercisesCompleted" },
                  avgSets: { $avg: "$setsCompleted" },
                },
              },
            ],
            daily84: [
              { $match: { startedAt: { $gte: days84Ago } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$startedAt" },
                  },
                  sessions: { $sum: 1 },
                  volume: { $sum: "$totalVolume" },
                  completed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            monthly12: [
              { $match: { startedAt: { $gte: months12Ago } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m", date: "$startedAt" },
                  },
                  sessions: { $sum: 1 },
                  volume: { $sum: "$totalVolume" },
                  completed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            byWeekday: [
              {
                $group: {
                  _id: { $dayOfWeek: "$startedAt" },
                  count: { $sum: 1 },
                },
              },
            ],
            byHour: [
              { $group: { _id: { $hour: "$startedAt" }, count: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Rankings
      WorkoutSession.aggregate([
        {
          $match: { ...sessionMatch, status: WORKOUT_SESSION_STATUS.COMPLETED },
        },
        {
          $group: {
            _id: "$member",
            totalVolume: { $sum: "$totalVolume" },
            completedSessions: { $sum: 1 },
          },
        },
        { $sort: { totalVolume: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            name: "$user.name",
            totalVolume: 1,
            completedSessions: 1,
          },
        },
      ]),

      WorkoutSession.aggregate([
        { $match: sessionMatch },
        { $group: { _id: "$assignment", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "assignments",
            localField: "_id",
            foreignField: "_id",
            as: "assign",
          },
        },
        { $unwind: "$assign" },
        {
          $lookup: {
            from: "workouts",
            localField: "assign.workout",
            foreignField: "_id",
            as: "work",
          },
        },
        { $unwind: "$work" },
        {
          $group: {
            _id: "$work._id",
            name: { $first: "$work.title" },
            uses: { $sum: "$count" },
          },
        },
        { $sort: { uses: -1 } },
      ]),

      // Top Exercises using WorkoutExerciseLog
      WorkoutExerciseLog.aggregate([
        {
          $lookup: {
            from: "workoutsessions",
            localField: "session",
            foreignField: "_id",
            as: "sessDoc",
          },
        },
        { $unwind: "$sessDoc" },
        {
          $match: {
            "sessDoc.assignment": { $in: assignmentIds },
          },
        },
        { $group: { _id: "$exercise", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "exercises",
            localField: "_id",
            foreignField: "_id",
            as: "ex",
          },
        },
        { $unwind: "$ex" },
        { $project: { name: "$ex.name", count: 1 } },
      ]),

      // Recent Activity Fetchers
      WorkoutSession.find(sessionMatch)
        .sort({ startedAt: -1 })
        .limit(10)
        .populate("member", "name")
        .populate({
          path: "assignment",
          populate: { path: "workout", select: "title" },
        }),

      Assignment.find(assignmentMatch)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("member", "name")
        .populate("workout", "title"),

      // Admin Only Trainers Ranking
      isAdmin
        ? Assignment.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$trainer", assignmentsCount: { $sum: 1 } } },
            { $sort: { assignmentsCount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "trainer",
              },
            },
            { $unwind: "$trainer" },
            { $project: { name: "$trainer.name", score: "$assignmentsCount" } },
          ])
        : Promise.resolve([]),
    ]);

    // ============================================================================
    // DATA FORMATTING & SYNTHESIS
    // ============================================================================
    const sysTotalMembers =
      globalUserStats.find((s) => s._id === Roles.MEMBER)?.count || 0;
    const sysTotalTrainers =
      globalUserStats.find((s) => s._id === Roles.TRAINER)?.count || 0;

    const assignStats = assignmentsFacet[0].statusCounts;
    let totalAssignments = 0;
    let activeAssignments = 0;
    let completedAssignments = 0;
    let cancelledAssignments = 0;

    const assignmentStatusData = assignStats.map((stat: any) => {
      totalAssignments += stat.count;
      if (stat._id === ASSIGNMENT_STATUS.ACTIVE) activeAssignments = stat.count;
      if (stat._id === ASSIGNMENT_STATUS.COMPLETED)
        completedAssignments = stat.count;
      if (stat._id === "CANCELLED") cancelledAssignments = stat.count;
      return { status: stat._id, value: stat.count };
    });

    const sessOverview = sessionsFacet[0].overview[0] || {
      total: 0,
      completed: 0,
      active: 0,
      totalDuration: 0,
      avgDuration: 0,
      totalVolume: 0,
      avgVolume: 0,
      avgExercises: 0,
      avgSets: 0,
    };

    // Chart timeline paddings
    const daily84Labels = getPastDates(84);
    const daily84Filled = fillDailyData(
      daily84Labels,
      sessionsFacet[0].daily84,
      { sessions: 0, volume: 0, completed: 0 },
    );
    const sessionsLast12Weeks = chunkIntoWeeks(daily84Filled, 12, {
      sessions: 0,
      volume: 0,
    });

    const monthly12Labels = getPastMonths(12);
    const sessionsLast12Months = fillMonthlyData(
      monthly12Labels,
      sessionsFacet[0].monthly12,
      { sessions: 0, volume: 0, completed: 0 },
    );
    const assignmentsCreatedPerMonth = fillMonthlyData(
      monthly12Labels,
      assignmentsFacet[0].monthlyCreated,
      { count: 0 },
    );

    // Recent Activity Merger
    const combinedActivity = [
      ...recentSessionsRaw.map((s: any) => ({
        id: s._id,
        message: `${s.member?.name || "Member"} ${s.status === WORKOUT_SESSION_STATUS.COMPLETED ? "completed" : "started"} ${s.assignment?.workout?.title || "a workout"}`,
        date: s.startedAt,
        type: "SESSION",
      })),
      ...recentAssignmentsRaw.map((a: any) => ({
        id: a._id,
        message: `Assigned ${a.workout?.title || "workout"} to ${a.member?.name || "Member"}`,
        date: a.createdAt,
        type: "ASSIGNMENT",
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 15);

    return {
      overview: {
        totalMembers: isAdmin ? sysTotalMembers : memberIds.length,
        ...(isAdmin && { totalTrainers: sysTotalTrainers }),
        totalExercises,
        totalWorkouts,
        totalAssignments,
        activeAssignments,
        totalCompletedAssignments: completedAssignments,
        totalCancelledAssignments: cancelledAssignments,
        activeSessions: sessOverview.active,
        completedSessions: sessOverview.completed,
        completionRate:
          sessOverview.total > 0
            ? Math.round((sessOverview.completed / sessOverview.total) * 100)
            : 0,
        averageSessionDuration: Math.round(sessOverview.avgDuration),
        averageCompletionRate:
          sessOverview.total > 0
            ? Math.round((sessOverview.completed / sessOverview.total) * 100)
            : 0,
        averageExercisesPerSession: Math.round(sessOverview.avgExercises),
        averageSetsPerSession: Math.round(sessOverview.avgSets),
        totalWorkoutVolume: sessOverview.totalVolume,
        totalWorkoutMinutes: sessOverview.totalDuration,
      },
      charts: {
        sessionsPerWeek: sessionsLast12Weeks,
        sessionsPerMonth: sessionsLast12Months,
        assignmentsCreatedPerMonth,
        workoutCompletionRateOverTime: sessionsLast12Months.map((m: any) => ({
          month: m.month,
          rate:
            m.sessions > 0 ? Math.round((m.completed / m.sessions) * 100) : 0,
        })),
        averageWorkoutVolumePerWeek: sessionsLast12Weeks,
        mostUsedExercises: topExercisesData,
        workoutPopularity: topWorkoutsData,
        sessionsByWeekday: fillWeekdays(sessionsFacet[0].byWeekday),
        sessionsByHourOfDay: fillHours(sessionsFacet[0].byHour),
        activeVsCompletedAssignments: assignmentStatusData,
        activeVsCompletedSessions: [
          { status: "Completed", value: sessOverview.completed },
          { status: "In Progress", value: sessOverview.active },
        ],
      },
      rankings: {
        topMembersByVolume,
        topMembersBySessions: [...topMembersByVolume].sort(
          (a: any, b: any) => b.completedSessions - a.completedSessions,
        ),
        topWorkouts: topWorkoutsData,
        topExercises: topExercisesData,
        ...(isAdmin && { topTrainers: topTrainersData }),
      },
      trends: {
        averageWorkoutVolume: Math.round(sessOverview.avgVolume),
        averageWorkoutDuration: Math.round(sessOverview.avgDuration),
        averageExercisesCompleted: Math.round(sessOverview.avgExercises),
        averageSetsCompleted: Math.round(sessOverview.avgSets),
        completionRate:
          sessOverview.total > 0
            ? Math.round((sessOverview.completed / sessOverview.total) * 100)
            : 0,
      },
      recentActivity: combinedActivity,
    };
  }

  // ============================================================================
  // MEMBER DASHBOARD
  // ============================================================================
  async getMemberDashboard(memberId: string) {
    const userObjectId = new mongoose.Types.ObjectId(memberId);
    const sessionMatch = { member: userObjectId, isActive: true };

    const now = new Date();
    const days30Ago = new Date(now);
    days30Ago.setDate(days30Ago.getDate() - 30);
    const months12Ago = new Date(now);
    months12Ago.setMonth(months12Ago.getMonth() - 12);

    const [
      activeAssignment,
      sessionsFacet,
      favoriteExerciseData,
      strongestExerciseData,
      recentSessionsRaw,
      recentAssignmentsRaw,
    ] = await Promise.all([
      Assignment.findOne({
        member: userObjectId,
        status: ASSIGNMENT_STATUS.ACTIVE,
        isActive: true,
      }).populate("workout"),

      WorkoutSession.aggregate([
        { $match: sessionMatch },
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                        1,
                        0,
                      ],
                    },
                  },
                  totalVolume: { $sum: "$totalVolume" },
                  totalDuration: { $sum: "$duration" },
                  avgDuration: { $avg: "$duration" },
                  avgVolume: { $avg: "$totalVolume" },
                  totalExercises: { $sum: "$exercisesCompleted" },
                  totalSets: { $sum: "$setsCompleted" },
                },
              },
            ],
            daily30: [
              { $match: { startedAt: { $gte: days30Ago } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$startedAt" },
                  },
                  sessions: { $sum: 1 },
                  volume: { $sum: "$totalVolume" },
                  duration: { $avg: "$duration" },
                  exercises: { $sum: "$exercisesCompleted" },
                  sets: { $sum: "$setsCompleted" },
                },
              },
            ],
            monthly12: [
              { $match: { startedAt: { $gte: months12Ago } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m", date: "$startedAt" },
                  },
                  volume: { $sum: "$totalVolume" },
                },
              },
            ],
            byWeekday: [
              {
                $group: {
                  _id: { $dayOfWeek: "$startedAt" },
                  count: { $sum: 1 },
                },
              },
            ],
            byHour: [
              { $group: { _id: { $hour: "$startedAt" }, count: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Favorite Exercise Data (via WorkoutExerciseLog)
      WorkoutExerciseLog.aggregate([
        {
          $lookup: {
            from: "workoutsessions",
            localField: "session",
            foreignField: "_id",
            as: "sessDoc",
          },
        },
        { $unwind: "$sessDoc" },
        { $match: { "sessDoc.member": userObjectId } },
        { $group: { _id: "$exercise", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "exercises",
            localField: "_id",
            foreignField: "_id",
            as: "ex",
          },
        },
        { $unwind: "$ex" },
        { $project: { name: "$ex.name", val: "$count" } },
      ]),

      // Strongest Exercise Data (via WorkoutSetLog)
      WorkoutSetLog.aggregate([
        { $match: { completed: true } },
        {
          $lookup: {
            from: "workoutexerciselogs",
            localField: "exerciseLog",
            foreignField: "_id",
            as: "exLogDoc",
          },
        },
        { $unwind: "$exLogDoc" },
        {
          $lookup: {
            from: "workoutsessions",
            localField: "exLogDoc.session",
            foreignField: "_id",
            as: "sessDoc",
          },
        },
        { $unwind: "$sessDoc" },
        { $match: { "sessDoc.member": userObjectId } },
        {
          $group: {
            _id: "$exLogDoc.exercise",
            maxWeight: { $max: "$weight" },
          },
        },
        { $sort: { maxWeight: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "exercises",
            localField: "_id",
            foreignField: "_id",
            as: "ex",
          },
        },
        { $unwind: "$ex" },
        { $project: { name: "$ex.name", val: "$maxWeight" } },
      ]),

      WorkoutSession.find({
        ...sessionMatch,
        status: WORKOUT_SESSION_STATUS.COMPLETED,
      })
        .sort({ startedAt: -1 })
        .limit(10)
        .populate({
          path: "assignment",
          populate: { path: "workout", select: "title" },
        }),

      Assignment.find({ member: userObjectId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("workout", "title"),
    ]);

    const sessOverview = sessionsFacet[0].overview[0] || {
      total: 0,
      completed: 0,
      totalVolume: 0,
      totalDuration: 0,
      avgDuration: 0,
      avgVolume: 0,
      totalExercises: 0,
      totalSets: 0,
    };

    // Timeline Fillers
    const daily30Labels = getPastDates(30);
    const daily30Filled = fillDailyData(
      daily30Labels,
      sessionsFacet[0].daily30,
      { sessions: 0, volume: 0, duration: 0, exercises: 0, sets: 0 },
    );

    const monthly12Labels = getPastMonths(12);
    const monthly12Filled = fillMonthlyData(
      monthly12Labels,
      sessionsFacet[0].monthly12,
      { volume: 0 },
    );

    // Calculate Week/Month totals dynamically from padded arrays
    const workoutsThisWeek = daily30Filled
      .slice(-7)
      .reduce((acc: number, curr: any) => acc + curr.sessions, 0);
    const workoutsThisMonth = daily30Filled.reduce(
      (acc: number, curr: any) => acc + curr.sessions,
      0,
    );

    // Current Streak logic
    let currentStreak = 0;
    if (recentSessionsRaw.length > 0) {
      const dates = [
        ...new Set(
          recentSessionsRaw.map(
            (s: any) => s.startedAt?.toISOString().split("T")[0],
          ),
        ),
      ];
      let checkDate = new Date();
      if (dates[0] !== checkDate.toISOString().split("T")[0])
        checkDate.setDate(checkDate.getDate() - 1);

      for (const d of dates) {
        if (d === checkDate.toISOString().split("T")[0]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }
    }

    const combinedActivity = [
      ...recentSessionsRaw.map((s: any) => ({
        id: s._id,
        message: `Finished ${s.assignment?.workout?.title || "workout"}`,
        date: s.startedAt,
        type: "SESSION_COMPLETED",
      })),
      ...recentAssignmentsRaw.map((a: any) => ({
        id: a._id,
        message: `Received ${a.workout?.title || "new workout"} assignment`,
        date: a.createdAt,
        type: "ASSIGNMENT_RECEIVED",
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 15);

    // Additional single aggregates missing from facets
    const [longestWorkout] = await WorkoutSession.find(sessionMatch)
      .sort({ duration: -1 })
      .limit(1)
      .select("duration");
    const [shortestWorkout] = await WorkoutSession.find({
      ...sessionMatch,
      duration: { $gt: 0 },
    })
      .sort({ duration: 1 })
      .limit(1)
      .select("duration");

    const favWorkoutData =
      recentSessionsRaw.length > 0
        ? Object.entries(
            recentSessionsRaw.reduce((acc: any, s: any) => {
              const title = s.assignment?.workout?.title || "Unknown";
              acc[title] = (acc[title] || 0) + 1;
              return acc;
            }, {}),
          ).sort((a: any, b: any) => b[1] - a[1])[0]
        : null;

    return {
      overview: {
        activeAssignment: activeAssignment || null,
        currentWorkout: activeAssignment ? activeAssignment.workout : null,
        totalSessions: sessOverview.total,
        completedSessions: sessOverview.completed,
        currentProgress:
          sessOverview.total > 0
            ? Math.round((sessOverview.completed / sessOverview.total) * 100)
            : 0,
        currentStreak,
        bestStreak: currentStreak,
        exercisesCompleted: sessOverview.totalExercises,
        totalSetsCompleted: sessOverview.totalSets,

        // New Additions
        totalVolumeLifted: sessOverview.totalVolume,
        totalWorkoutMinutes: sessOverview.totalDuration,
        averageWorkoutDuration: Math.round(sessOverview.avgDuration),
        averageVolumePerWorkout: Math.round(sessOverview.avgVolume),
        attendanceRate:
          sessOverview.total > 0
            ? Math.round((sessOverview.completed / sessOverview.total) * 100)
            : 0,
        completionRate:
          sessOverview.total > 0
            ? Math.round((sessOverview.completed / sessOverview.total) * 100)
            : 0,
        workoutsThisWeek,
        workoutsThisMonth,
      },
      charts: {
        workoutVolumeLast30Days: daily30Filled.map((d: any) => ({
          date: d.date,
          volume: d.volume,
        })),
        workoutVolumeLast12Months: monthly12Filled,
        sessionDurationTrend: daily30Filled.map((d: any) => ({
          date: d.date,
          duration: d.duration,
        })),
        exercisesCompletedPerWeek: chunkIntoWeeks(daily30Filled, 4, {
          exercises: 0,
        }),
        setsCompletedPerWeek: chunkIntoWeeks(daily30Filled, 4, { sets: 0 }),
        workoutFrequencyByWeekday: fillWeekdays(sessionsFacet[0].byWeekday),
        workoutFrequencyByHour: fillHours(sessionsFacet[0].byHour),
      },
      rankings: {},
      trends: {
        strongestExercise: strongestExerciseData[0] || null,
        favoriteWorkout: favWorkoutData
          ? { name: favWorkoutData[0], timesCompleted: favWorkoutData[1] }
          : null,
        favoriteExercise: favoriteExerciseData[0] || null,
        longestWorkout: longestWorkout?.duration || 0,
        shortestWorkout: shortestWorkout?.duration || 0,
        bestMonth:
          [...monthly12Filled].sort(
            (a: any, b: any) => b.volume - a.volume,
          )[0] || null,
      },
      recentActivity: combinedActivity,
    };
  }
}

export default new DashboardService();
