// src/services/dashboard.service.ts
import prisma from "../config/prisma.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import nutritionService from "./nutrition.service.js";

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
    const sumObj: any = { week: `Week of ${chunk[0]?.date || ""}` };
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

    const assignmentWhere = {
      isActive: true,
      ...(isAdmin ? {} : { trainerId: userId }),
    };

    const workoutWhere = {
      isActive: true,
      ...(isAdmin ? {} : { createdBy: userId }),
    };

    const assignments = await prisma.assignment.findMany({
      where: assignmentWhere,
      select: {
        id: true,
        memberId: true,
        workoutId: true,
        status: true,
        createdAt: true,
      },
    });

    const assignmentIds = assignments.map((a) => a.id);
    const memberIds = [...new Set(assignments.map((a) => a.memberId))];

    const sessionWhere = {
      isActive: true,
      ...(isAdmin ? {} : { assignmentId: { in: assignmentIds } }),
    };

    const now = new Date();
    const days84Ago = new Date(now);
    days84Ago.setDate(days84Ago.getDate() - 84); // 12 weeks
    const months12Ago = new Date(now);
    months12Ago.setMonth(months12Ago.getMonth() - 12);

    const [
      memberCount,
      trainerCount,
      totalExercises,
      totalWorkouts,
      sessions,
      exerciseLogsGrouped,
      recentSessionsRaw,
      recentAssignmentsRaw,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Roles.MEMBER, isActive: true } }),
      prisma.user.count({ where: { role: Roles.TRAINER, isActive: true } }),
      prisma.exercise.count({ where: { isActive: true } }),
      prisma.workout.count({ where: workoutWhere }),
      prisma.workoutSession.findMany({
        where: sessionWhere,
        select: {
          id: true,
          memberId: true,
          assignmentId: true,
          workoutId: true,
          status: true,
          duration: true,
          totalVolume: true,
          exercisesCompleted: true,
          setsCompleted: true,
          startedAt: true,
        },
      }),
      prisma.workoutExerciseLog.groupBy({
        by: ["exerciseId"],
        where: {
          session: sessionWhere,
        },
        _count: { exerciseId: true },
        orderBy: { _count: { exerciseId: "desc" } },
        take: 10,
      }),
      prisma.workoutSession.findMany({
        where: sessionWhere,
        orderBy: { startedAt: "desc" },
        take: 10,
        include: {
          member: { select: { id: true, name: true } },
          assignment: {
            include: { workout: { select: { id: true, title: true } } },
          },
        },
      }),
      prisma.assignment.findMany({
        where: assignmentWhere,
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          member: { select: { id: true, name: true } },
          workout: { select: { id: true, title: true } },
        },
      }),
    ]);

    // Assignments metrics
    let totalAssignments = 0;
    let activeAssignments = 0;
    let completedAssignments = 0;
    let cancelledAssignments = 0;
    const assignmentStatusMap = new Map<string, number>();
    const assignmentsMonthlyMap = new Map<string, number>();

    assignments.forEach((a) => {
      totalAssignments++;
      assignmentStatusMap.set(
        a.status,
        (assignmentStatusMap.get(a.status) || 0) + 1,
      );
      if (a.status === ASSIGNMENT_STATUS.ACTIVE) activeAssignments++;
      if (a.status === ASSIGNMENT_STATUS.COMPLETED) completedAssignments++;
      if (a.status === "CANCELLED") cancelledAssignments++;

      if (a.createdAt >= months12Ago) {
        const ym = a.createdAt.toISOString().slice(0, 7);
        assignmentsMonthlyMap.set(
          ym,
          (assignmentsMonthlyMap.get(ym) || 0) + 1,
        );
      }
    });

    const assignmentStatusData = Array.from(assignmentStatusMap.entries()).map(
      ([status, value]) => ({ status, value }),
    );

    // Sessions overview & distributions
    let completedSessionsCount = 0;
    let activeSessionsCount = 0;
    let totalDurationSum = 0;
    let totalVolumeSum = 0;
    let totalExercisesSum = 0;
    let totalSetsSum = 0;

    const daily84Map = new Map<
      string,
      { sessions: number; volume: number; completed: number }
    >();
    const monthly12Map = new Map<
      string,
      { sessions: number; volume: number; completed: number }
    >();
    const weekdayMap = new Map<number, number>();
    const hourMap = new Map<number, number>();
    const memberVolumeMap = new Map<
      string,
      { totalVolume: number; completedSessions: number }
    >();
    const workoutUseMap = new Map<string, number>();

    // Map assignmentId -> workoutId
    const assignToWorkoutMap = new Map(assignments.map((a) => [a.id, a.workoutId]));

    sessions.forEach((s) => {
      const isCompleted = s.status === WORKOUT_SESSION_STATUS.COMPLETED;
      const isInProgress = s.status === WORKOUT_SESSION_STATUS.IN_PROGRESS;

      if (isCompleted) completedSessionsCount++;
      if (isInProgress) activeSessionsCount++;

      totalDurationSum += s.duration || 0;
      totalVolumeSum += s.totalVolume || 0;
      totalExercisesSum += s.exercisesCompleted || 0;
      totalSetsSum += s.setsCompleted || 0;

      if (s.startedAt) {
        if (s.startedAt >= days84Ago) {
          const dStr = s.startedAt.toISOString().split("T")[0];
          const cur = daily84Map.get(dStr) || {
            sessions: 0,
            volume: 0,
            completed: 0,
          };
          cur.sessions++;
          cur.volume += s.totalVolume || 0;
          if (isCompleted) cur.completed++;
          daily84Map.set(dStr, cur);
        }

        if (s.startedAt >= months12Ago) {
          const mStr = s.startedAt.toISOString().slice(0, 7);
          const cur = monthly12Map.get(mStr) || {
            sessions: 0,
            volume: 0,
            completed: 0,
          };
          cur.sessions++;
          cur.volume += s.totalVolume || 0;
          if (isCompleted) cur.completed++;
          monthly12Map.set(mStr, cur);
        }

        const weekday = s.startedAt.getDay() + 1; // 1 (Sun) - 7 (Sat)
        weekdayMap.set(weekday, (weekdayMap.get(weekday) || 0) + 1);

        const hour = s.startedAt.getHours(); // 0 - 23
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }

      if (isCompleted) {
        const cur = memberVolumeMap.get(s.memberId) || {
          totalVolume: 0,
          completedSessions: 0,
        };
        cur.totalVolume += s.totalVolume || 0;
        cur.completedSessions += 1;
        memberVolumeMap.set(s.memberId, cur);
      }

      if (s.assignmentId) {
        const wId = assignToWorkoutMap.get(s.assignmentId);
        if (wId) {
          workoutUseMap.set(wId, (workoutUseMap.get(wId) || 0) + 1);
        }
      } else if (s.workoutId) {
        workoutUseMap.set(s.workoutId, (workoutUseMap.get(s.workoutId) || 0) + 1);
      }
    });

    const totalSessions = sessions.length;
    const avgDuration = totalSessions > 0 ? totalDurationSum / totalSessions : 0;
    const avgVolume = totalSessions > 0 ? totalVolumeSum / totalSessions : 0;
    const avgExercises =
      totalSessions > 0 ? totalExercisesSum / totalSessions : 0;
    const avgSets = totalSessions > 0 ? totalSetsSum / totalSessions : 0;

    // Rankings: Top Members
    const topMemberEntries = Array.from(memberVolumeMap.entries())
      .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
      .slice(0, 10);

    const topMemberUsers = await prisma.user.findMany({
      where: { id: { in: topMemberEntries.map((e) => e[0]) } },
      select: { id: true, name: true },
    });
    const userNameMap = new Map(topMemberUsers.map((u) => [u.id, u.name]));

    const topMembersByVolume = topMemberEntries.map(([mId, stats]) => ({
      name: userNameMap.get(mId) || "Member",
      totalVolume: stats.totalVolume,
      completedSessions: stats.completedSessions,
    }));

    // Rankings: Top Workouts
    const topWorkoutEntries = Array.from(workoutUseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topWorkoutDocs = await prisma.workout.findMany({
      where: { id: { in: topWorkoutEntries.map((e) => e[0]) } },
      select: { id: true, title: true },
    });
    const workoutNameMap = new Map(
      topWorkoutDocs.map((w) => [w.id, w.title]),
    );

    const topWorkoutsData = topWorkoutEntries.map(([wId, uses]) => ({
      _id: wId,
      name: workoutNameMap.get(wId) || "Workout",
      uses,
    }));

    // Rankings: Top Exercises
    const topExerciseDocs = await prisma.exercise.findMany({
      where: { id: { in: exerciseLogsGrouped.map((l) => l.exerciseId) } },
      select: { id: true, name: true },
    });
    const exerciseNameMap = new Map(
      topExerciseDocs.map((e) => [e.id, e.name]),
    );

    const topExercisesData = exerciseLogsGrouped.map((l) => ({
      name: exerciseNameMap.get(l.exerciseId) || "Exercise",
      count: l._count.exerciseId,
    }));

    // Rankings: Top Trainers (Admin only)
    let topTrainersData: any[] = [];
    if (isAdmin) {
      const trainerAssignments = await prisma.assignment.groupBy({
        by: ["trainerId"],
        where: { isActive: true },
        _count: { trainerId: true },
        orderBy: { _count: { trainerId: "desc" } },
        take: 10,
      });

      const trainerUsers = await prisma.user.findMany({
        where: { id: { in: trainerAssignments.map((t) => t.trainerId) } },
        select: { id: true, name: true },
      });
      const trainerNameMap = new Map(
        trainerUsers.map((u) => [u.id, u.name]),
      );

      topTrainersData = trainerAssignments.map((t) => ({
        name: trainerNameMap.get(t.trainerId) || "Trainer",
        score: t._count.trainerId,
      }));
    }

    // Chart timeline paddings
    const daily84Labels = getPastDates(84);
    const daily84Data = Array.from(daily84Map.entries()).map(([dateStr, d]) => ({
      _id: dateStr,
      sessions: d.sessions,
      volume: d.volume,
      completed: d.completed,
    }));
    const daily84Filled = fillDailyData(daily84Labels, daily84Data, {
      sessions: 0,
      volume: 0,
      completed: 0,
    });
    const sessionsLast12Weeks = chunkIntoWeeks(daily84Filled, 12, {
      sessions: 0,
      volume: 0,
    });

    const monthly12Labels = getPastMonths(12);
    const monthly12Data = Array.from(monthly12Map.entries()).map(
      ([mStr, d]) => ({
        _id: mStr,
        sessions: d.sessions,
        volume: d.volume,
        completed: d.completed,
      }),
    );
    const sessionsLast12Months = fillMonthlyData(
      monthly12Labels,
      monthly12Data,
      { sessions: 0, volume: 0, completed: 0 },
    );

    const assignmentsMonthlyData = Array.from(
      assignmentsMonthlyMap.entries(),
    ).map(([mStr, count]) => ({
      _id: mStr,
      count,
    }));
    const assignmentsCreatedPerMonth = fillMonthlyData(
      monthly12Labels,
      assignmentsMonthlyData,
      { count: 0 },
    );

    const weekdayData = Array.from(weekdayMap.entries()).map(
      ([weekday, count]) => ({ _id: weekday, count }),
    );
    const hourData = Array.from(hourMap.entries()).map(([hour, count]) => ({
      _id: hour,
      count,
    }));

    // Recent Activity Merger
    const combinedActivity = [
      ...recentSessionsRaw.map((s) => ({
        id: s.id,
        message: `${s.member?.name || "Member"} ${
          s.status === WORKOUT_SESSION_STATUS.COMPLETED
            ? "completed"
            : "started"
        } ${s.assignment?.workout?.title || "a workout"}`,
        date: s.startedAt,
        type: "SESSION",
      })),
      ...recentAssignmentsRaw.map((a) => ({
        id: a.id,
        message: `Assigned ${a.workout?.title || "workout"} to ${
          a.member?.name || "Member"
        }`,
        date: a.createdAt,
        type: "ASSIGNMENT",
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 50);

    return {
      overview: {
        totalMembers: isAdmin ? memberCount : memberIds.length,
        ...(isAdmin && { totalTrainers: trainerCount }),
        totalExercises,
        totalWorkouts,
        totalAssignments,
        activeAssignments,
        totalCompletedAssignments: completedAssignments,
        totalCancelledAssignments: cancelledAssignments,
        activeSessions: activeSessionsCount,
        completedSessions: completedSessionsCount,
        completionRate:
          totalSessions > 0
            ? Math.round((completedSessionsCount / totalSessions) * 100)
            : 0,
        averageSessionDuration: Math.round(avgDuration),
        averageCompletionRate:
          totalSessions > 0
            ? Math.round((completedSessionsCount / totalSessions) * 100)
            : 0,
        averageExercisesPerSession: Math.round(avgExercises),
        averageSetsPerSession: Math.round(avgSets),
        totalWorkoutVolume: totalVolumeSum,
        totalWorkoutMinutes: totalDurationSum,
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
        sessionsByWeekday: fillWeekdays(weekdayData),
        sessionsByHourOfDay: fillHours(hourData),
        activeVsCompletedAssignments: assignmentStatusData,
        activeVsCompletedSessions: [
          { status: "Completed", value: completedSessionsCount },
          { status: "In Progress", value: activeSessionsCount },
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
        averageWorkoutVolume: Math.round(avgVolume),
        averageWorkoutDuration: Math.round(avgDuration),
        averageExercisesCompleted: Math.round(avgExercises),
        averageSetsCompleted: Math.round(avgSets),
        completionRate:
          totalSessions > 0
            ? Math.round((completedSessionsCount / totalSessions) * 100)
            : 0,
      },
      recentActivity: combinedActivity,
    };
  }

  // ============================================================================
  // MEMBER DASHBOARD
  // ============================================================================
  async getMemberDashboard(memberId: string) {
    const sessionWhere = { memberId, isActive: true };

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const days30Ago = new Date(now);
    days30Ago.setDate(days30Ago.getDate() - 30);
    const months12Ago = new Date(now);
    months12Ago.setMonth(months12Ago.getMonth() - 12);

    const [
      activeAssignmentsRaw,
      latestPersonalWorkout,
      sessions,
      favExLogs,
      maxWeightSet,
      recentSessionsRaw,
      recentAssignmentsRaw,
      longestWorkout,
      shortestWorkout,
      upcomingWorkoutsRaw,
      memberMeasurements,
      activeRelationship,
      pendingInvitation,
      unreadNotificationsCount,
      nutritionOverview,
    ] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          memberId,
          status: ASSIGNMENT_STATUS.ACTIVE,
          isActive: true,
        },
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        include: {
          workout: true,
          trainer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.workout.findFirst({
        where: {
          createdBy: memberId,
          isActive: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.workoutSession.findMany({
        where: sessionWhere,
        orderBy: { startedAt: "desc" },
        include: {
          workout: true,
          assignment: { include: { workout: true } },
        },
      }),
      prisma.workoutExerciseLog.groupBy({
        by: ["exerciseId"],
        where: { session: sessionWhere },
        _count: { exerciseId: true },
        orderBy: { _count: { exerciseId: "desc" } },
        take: 1,
      }),
      prisma.workoutSetLog.findFirst({
        where: {
          completed: true,
          exerciseLog: { session: sessionWhere },
        },
        orderBy: { weight: "desc" },
        include: {
          exerciseLog: {
            include: { exercise: { select: { name: true } } },
          },
        },
      }),
      prisma.workoutSession.findMany({
        where: {
          ...sessionWhere,
          status: WORKOUT_SESSION_STATUS.COMPLETED,
        },
        orderBy: { startedAt: "desc" },
        take: 35,
        include: {
          workout: { select: { title: true } },
          assignment: {
            include: { workout: { select: { title: true } } },
          },
        },
      }),
      prisma.assignment.findMany({
        where: { memberId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { workout: { select: { title: true } } },
      }),
      prisma.workoutSession.findFirst({
        where: sessionWhere,
        orderBy: { duration: "desc" },
        select: { duration: true },
      }),
      prisma.workoutSession.findFirst({
        where: {
          ...sessionWhere,
          duration: { gt: 0 },
        },
        orderBy: { duration: "asc" },
        select: { duration: true },
      }),
      prisma.scheduledWorkout
        ? prisma.scheduledWorkout.findMany({
            where: {
              memberId,
              status: { in: ["SCHEDULED", "RESCHEDULED"] },
              scheduledAt: { gte: startOfDay },
              isActive: true,
            },
            orderBy: { scheduledAt: "asc" },
            take: 10,
            include: {
              workout: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                  category: true,
                  estimatedDuration: true,
                },
              },
              trainer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          }).catch(() => [])
        : Promise.resolve([]),
      prisma.bodyMeasurement.findMany({
        where: { memberId, isActive: true },
        orderBy: { measuredAt: "desc" },
        take: 2,
        select: { weight: true, measuredAt: true },
      }).catch(() => []),
      prisma.coachMemberRelationship.findFirst({
        where: {
          memberId,
          status: "ACTIVE",
          isActive: true,
        },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              professionalTitle: true,
              specialties: true,
              certifications: true,
              yearsOfExperience: true,
              bio: true,
              coachingPhilosophy: true,
            },
          },
        },
      }).catch(() => null),
      prisma.coachMemberRelationship.findFirst({
        where: {
          memberId,
          status: "PENDING",
          isActive: true,
        },
        include: {
          trainer: { select: { id: true, name: true, email: true } },
        },
      }).catch(() => null),
      prisma.notification.count({
        where: {
          userId: memberId,
          readAt: null,
          isActive: true,
        },
      }).catch(() => 0),
      nutritionService.getMemberOverview(memberId).catch(() => null),
    ]);

    let favoriteExerciseData: any[] = [];
    if (favExLogs.length > 0) {
      const ex = await prisma.exercise.findUnique({
        where: { id: favExLogs[0].exerciseId },
        select: { name: true },
      });
      if (ex) {
        favoriteExerciseData = [
          { name: ex.name, val: favExLogs[0]._count.exerciseId },
        ];
      }
    }

    let strongestExerciseData: any[] = [];
    if (maxWeightSet && maxWeightSet.weight) {
      strongestExerciseData = [
        {
          name: maxWeightSet.exerciseLog.exercise.name,
          val: maxWeightSet.weight,
        },
      ];
    }

    const totalSessions = sessions.length;
    let completedSessions = 0;
    let inProgressSessions = 0;
    let cancelledSessions = 0;
    let totalVolume = 0;
    let totalDuration = 0;
    let totalExercises = 0;
    let totalSets = 0;

    const daily30Map = new Map<
      string,
      {
        sessions: number;
        volume: number;
        duration: number;
        exercises: number;
        sets: number;
      }
    >();
    const monthly12Map = new Map<string, { volume: number }>();
    const weekdayMap = new Map<number, number>();
    const hourMap = new Map<number, number>();

    sessions.forEach((s) => {
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED) {
        completedSessions++;
      } else if (s.status === WORKOUT_SESSION_STATUS.IN_PROGRESS) {
        inProgressSessions++;
      } else if (s.status === WORKOUT_SESSION_STATUS.CANCELLED) {
        cancelledSessions++;
      }
      totalVolume += s.totalVolume || 0;
      totalDuration += s.duration || 0;
      totalExercises += s.exercisesCompleted || 0;
      totalSets += s.setsCompleted || 0;

      if (s.startedAt) {
        if (s.startedAt >= days30Ago) {
          const dStr = s.startedAt.toISOString().split("T")[0];
          const cur = daily30Map.get(dStr) || {
            sessions: 0,
            volume: 0,
            duration: 0,
            exercises: 0,
            sets: 0,
          };
          cur.sessions++;
          cur.volume += s.totalVolume || 0;
          cur.duration += s.duration || 0;
          cur.exercises += s.exercisesCompleted || 0;
          cur.sets += s.setsCompleted || 0;
          daily30Map.set(dStr, cur);
        }

        if (s.startedAt >= months12Ago) {
          const mStr = s.startedAt.toISOString().slice(0, 7);
          const cur = monthly12Map.get(mStr) || { volume: 0 };
          cur.volume += s.totalVolume || 0;
          monthly12Map.set(mStr, cur);
        }

        const weekday = s.startedAt.getDay() + 1;
        weekdayMap.set(weekday, (weekdayMap.get(weekday) || 0) + 1);

        const hour = s.startedAt.getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
      }
    });

    const avgDuration =
      completedSessions > 0
        ? Math.round(totalDuration / completedSessions)
        : totalSessions > 0
          ? Math.round(totalDuration / totalSessions)
          : 0;
    const avgVolume =
      completedSessions > 0
        ? Math.round(totalVolume / completedSessions)
        : totalSessions > 0
          ? Math.round(totalVolume / totalSessions)
          : 0;

    // Timeline Fillers
    const daily30Labels = getPastDates(30);
    const daily30Data = Array.from(daily30Map.entries()).map(([dStr, d]) => ({
      _id: dStr,
      sessions: d.sessions,
      volume: d.volume,
      duration: d.sessions > 0 ? Math.round(d.duration / d.sessions) : 0,
      exercises: d.exercises,
      sets: d.sets,
    }));

    const daily30Filled = fillDailyData(daily30Labels, daily30Data, {
      sessions: 0,
      volume: 0,
      duration: 0,
      exercises: 0,
      sets: 0,
    });

    const monthly12Labels = getPastMonths(12);
    const monthly12Data = Array.from(monthly12Map.entries()).map(
      ([mStr, d]) => ({
        _id: mStr,
        volume: d.volume,
      }),
    );
    const monthly12Filled = fillMonthlyData(monthly12Labels, monthly12Data, {
      volume: 0,
    });

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
          recentSessionsRaw
            .filter((s) => s.startedAt)
            .map((s) => s.startedAt!.toISOString().split("T")[0]),
        ),
      ];
      let checkDate = new Date();
      if (dates[0] !== checkDate.toISOString().split("T")[0]) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      for (const d of dates) {
        if (d === checkDate.toISOString().split("T")[0]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }
    }

    const combinedActivity = [
      ...recentSessionsRaw.map((s: any) => ({
        id: s.id,
        message: `Finished ${s.assignment?.workout?.title || s.workout?.title || "workout"}`,
        date: s.startedAt,
        type: "SESSION_COMPLETED",
      })),
      ...recentAssignmentsRaw.map((a) => ({
        id: a.id,
        message: `Received ${a.workout?.title || "new workout"} assignment`,
        date: a.createdAt,
        type: "ASSIGNMENT_RECEIVED",
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 50);

    const favWorkoutData =
      recentSessionsRaw.length > 0
        ? Object.entries(
            recentSessionsRaw.reduce((acc: any, s: any) => {
              const title =
                s.assignment?.workout?.title || s.workout?.title || "Unknown";
              acc[title] = (acc[title] || 0) + 1;
              return acc;
            }, {}),
          ).sort((a: any, b: any) => b[1] - a[1])[0]
        : null;

    const weekdayData = Array.from(weekdayMap.entries()).map(
      ([weekday, count]) => ({ _id: weekday, count }),
    );
    const hourData = Array.from(hourMap.entries()).map(([hour, count]) => ({
      _id: hour,
      count,
    }));

    // Latest Body Weight Measurement
    const latestMeasurement =
      memberMeasurements && memberMeasurements.length > 0
        ? {
            weight: memberMeasurements[0].weight,
            unit: "kg",
            measuredAt: memberMeasurements[0].measuredAt,
            diffFromPrevious:
              memberMeasurements.length > 1
                ? Number(
                    (
                      memberMeasurements[0].weight - memberMeasurements[1].weight
                    ).toFixed(1),
                  )
                : null,
          }
        : null;

    // 30-Day Training Consistency (Days with at least 1 completed workout / 30)
    const completedDaysLast30 = new Set(
      sessions
        .filter(
          (s) =>
            s.status === WORKOUT_SESSION_STATUS.COMPLETED &&
            s.startedAt &&
            s.startedAt >= days30Ago,
        )
        .map((s) => s.startedAt!.toISOString().split("T")[0]),
    ).size;

    const consistency30Days = {
      activeDays: completedDaysLast30,
      totalDays: 30,
      percentage: Math.round((completedDaysLast30 / 30) * 100),
    };

    // Existing Coaching Relationship Connection
    const coachConnection = activeRelationship
      ? {
          hasActiveCoach: true,
          status: activeRelationship.status,
          historySharingConsent: activeRelationship.historySharingConsent,
          coach: activeRelationship.trainer
            ? {
                id: activeRelationship.trainer.id,
                name: activeRelationship.trainer.name,
                email: activeRelationship.trainer.email,
                avatarUrl: (activeRelationship.trainer as any).avatarUrl || null,
                professionalTitle:
                  activeRelationship.trainer.professionalTitle || null,
                specialties: activeRelationship.trainer.specialties || [],
                certifications:
                  activeRelationship.trainer.certifications || [],
                yearsOfExperience:
                  activeRelationship.trainer.yearsOfExperience || 0,
                bio: activeRelationship.trainer.bio || null,
                coachingPhilosophy:
                  activeRelationship.trainer.coachingPhilosophy || null,
              }
            : null,
          startedAt: activeRelationship.startedAt,
        }
      : {
          hasActiveCoach: false,
          status: null,
          historySharingConsent: null,
          coach: null,
          startedAt: null,
        };

    // Existing Actionable Items (Needs Attention)
    const needsAttention = {
      pendingInvitation: pendingInvitation
        ? {
            id: pendingInvitation.id,
            trainer: pendingInvitation.trainer,
            invitedAt: pendingInvitation.invitedAt,
            notes: pendingInvitation.notes,
          }
        : null,
      unreadNotificationsCount: unreadNotificationsCount || 0,
    };

    // Nutrition snapshot derived from active NutritionPlan and FoodLogs
    const nutritionSnapshot = nutritionOverview
      ? {
          hasActivePlan: nutritionOverview.hasActivePlan,
          onboardingCompleted: nutritionOverview.onboardingCompleted,
          planName: nutritionOverview.plan?.name || null,
          planSource: nutritionOverview.plan?.source || null,
          coachName: nutritionOverview.plan?.coach?.name || null,
          targetCalories: nutritionOverview.intake?.targetCalories || 0,
          loggedCalories: nutritionOverview.intake?.loggedCalories || 0,
          remainingCalories: nutritionOverview.intake?.remainingCalories || 0,
          calorieProgressPct: nutritionOverview.intake?.calorieProgressPct || 0,
          targetProteinG: nutritionOverview.intake?.targetProteinG || 0,
          loggedProteinG: nutritionOverview.intake?.loggedProteinG || 0,
          proteinProgressPct: nutritionOverview.intake?.proteinProgressPct || 0,
          targetCarbsG: nutritionOverview.intake?.targetCarbsG || 0,
          loggedCarbsG: nutritionOverview.intake?.loggedCarbsG || 0,
          carbsProgressPct: nutritionOverview.intake?.carbsProgressPct || 0,
          targetFatG: nutritionOverview.intake?.targetFatG || 0,
          loggedFatG: nutritionOverview.intake?.loggedFatG || 0,
          fatProgressPct: nutritionOverview.intake?.fatProgressPct || 0,
          logsCount: nutritionOverview.todayLogs?.length || 0,
        }
      : null;

    const upcomingWorkouts = (upcomingWorkoutsRaw || []).map((sw: any) => ({
      id: sw.id,
      workoutId: sw.workoutId,
      scheduledAt: sw.scheduledAt,
      notes: sw.notes,
      workout: sw.workout,
      trainer: sw.trainer || null,
    }));

    const activeAssignments = activeAssignmentsRaw || [];
    const activeAssignment = activeAssignments[0] || null;

    const inProgressSession = sessions.find(
      (s) => s.status === WORKOUT_SESSION_STATUS.IN_PROGRESS,
    );

    const resolvedCurrentWorkout = inProgressSession
      ? inProgressSession.workout || (inProgressSession.assignment as any)?.workout
      : upcomingWorkouts.length > 0 && upcomingWorkouts[0].workout
        ? upcomingWorkouts[0].workout
        : activeAssignment
          ? activeAssignment.workout
          : latestPersonalWorkout || null;

    return {
      overview: {
        activeAssignment: activeAssignment || null,
        activeAssignments,
        currentWorkout: resolvedCurrentWorkout,
        upcomingWorkouts,
        totalSessions,
        completedSessions,
        currentProgress:
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0,
        currentStreak,
        bestStreak: currentStreak,
        exercisesCompleted: totalExercises,
        totalSetsCompleted: totalSets,
        totalVolumeLifted: totalVolume,
        totalWorkoutMinutes: totalDuration,
        averageWorkoutDuration: Math.round(avgDuration),
        averageVolumePerWorkout: Math.round(avgVolume),
        attendanceRate:
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0,
        completionRate:
          totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 100)
            : 0,
        workoutsThisWeek,
        workoutsThisMonth,
        latestMeasurement,
        consistency30Days,
        coachConnection,
        needsAttention,
        nutritionSnapshot,
      },
      nutritionSnapshot,
      latestMeasurement,
      consistency30Days,
      coachConnection,
      needsAttention,
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
        workoutFrequencyByWeekday: fillWeekdays(weekdayData),
        workoutFrequencyByHour: fillHours(hourData),
        sessionStatusDistribution: [
          {
            status: "Completed",
            count: completedSessions,
            percentage:
              totalSessions > 0
                ? Math.round((completedSessions / totalSessions) * 100)
                : 0,
            color: "#5BE584",
          },
          {
            status: "In Progress",
            count: inProgressSessions,
            percentage:
              totalSessions > 0
                ? Math.round((inProgressSessions / totalSessions) * 100)
                : 0,
            color: "#3B82F6",
          },
          {
            status: "Cancelled",
            count: cancelledSessions,
            percentage:
              totalSessions > 0
                ? Math.round((cancelledSessions / totalSessions) * 100)
                : 0,
            color: "#EF4444",
          },
        ],
      },
      upcomingWorkouts,
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
