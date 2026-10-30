// src/services/gamification.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import {
  SYSTEM_ACHIEVEMENTS,
  type SystemAchievementDefinition,
} from "../constants/achievements.js";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CATEGORY,
} from "../constants/notification.js";
import notificationService from "./notification.service.js";
import { Roles } from "../constants/roles.js";

export class GamificationService {
  private seeded = false;

  /**
   * Seed or sync system achievement definitions in database idempotently
   */
  public async seedSystemAchievements() {
    if (this.seeded) return;

    for (const def of SYSTEM_ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { code: def.code },
        create: {
          code: def.code,
          title: def.title,
          description: def.description,
          category: def.category as any,
          tier: def.tier as any,
          badgeIcon: def.badgeIcon,
          points: def.points,
          criteria: def.criteria as any,
          displayOrder: def.displayOrder,
          isActive: true,
        },
        update: {
          title: def.title,
          description: def.description,
          category: def.category as any,
          tier: def.tier as any,
          badgeIcon: def.badgeIcon,
          points: def.points,
          criteria: def.criteria as any,
          displayOrder: def.displayOrder,
        },
      });
    }

    this.seeded = true;
  }

  /**
   * Evaluate user metrics and award any newly qualified achievements idempotently
   */
  public async evaluateUserAchievements(userId: string) {
    await this.seedSystemAchievements();

    // 1. Gather all active achievements
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    // 2. Gather already earned achievements for this user
    const userEarned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, achievement: { select: { code: true } } },
    });
    const earnedCodes = new Set(userEarned.map((ue) => ue.achievement.code));

    // 3. Query actual domain activity for user
    const [completedSessions, foodLogs, bodyMeasurementsCount, userRecord] =
      await Promise.all([
        prisma.workoutSession.findMany({
          where: {
            memberId: userId,
            status: "COMPLETED",
            isActive: true,
          },
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
          },
          orderBy: { startedAt: "desc" },
        }),
        prisma.foodLog.findMany({
          where: {
            memberId: userId,
          },
          select: {
            date: true,
          },
        }),
        prisma.bodyMeasurement.count({
          where: {
            memberId: userId,
            isActive: true,
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true },
        }),
      ]);

    // Calculate Workout Metrics
    const totalCompletedWorkouts = completedSessions.length;

    // Calculate Unique Workout Dates (YYYY-MM-DD)
    const workoutDateStrings = Array.from(
      new Set(
        completedSessions.map(
          (s) => new Date(s.startedAt).toISOString().split("T")[0],
        ),
      ),
    ).sort((a, b) => b.localeCompare(a)); // Descending

    const { currentStreak, longestStreak } =
      this.calculateWorkoutStreaks(workoutDateStrings);

    // Current Week Completed Workouts (Monday - Sunday)
    const currentWeekCount = this.calculateCurrentWeekWorkouts(workoutDateStrings);

    // Comeback Check: gap of >= 14 days between two sessions, with the latest in the past 7 days
    const hadComeback = this.checkComeback(completedSessions);

    // Nutrition Metrics
    const nutritionUniqueDates = Array.from(
      new Set(
        foodLogs.map((fl) => new Date(fl.date).toISOString().split("T")[0]),
      ),
    );
    const totalNutritionDays = nutritionUniqueDates.length;
    const nutritionCurrentWeekCount =
      this.calculateCurrentWeekWorkouts(nutritionUniqueDates);

    // 4. Evaluate each unearned achievement against criteria
    const newlyAwarded: any[] = [];

    for (const ach of allAchievements) {
      if (earnedCodes.has(ach.code)) continue;

      const criteria = ach.criteria as any;
      let isEligible = false;
      let currentVal = 0;

      switch (criteria.type) {
        case "COMPLETED_WORKOUTS":
          currentVal = totalCompletedWorkouts;
          isEligible = totalCompletedWorkouts >= criteria.target;
          break;

        case "WORKOUT_STREAK":
          currentVal = Math.max(currentStreak, longestStreak);
          isEligible = currentVal >= criteria.target;
          break;

        case "WEEKLY_WORKOUTS":
          currentVal = currentWeekCount;
          isEligible = currentWeekCount >= criteria.target;
          break;

        case "COMEBACK":
          currentVal = hadComeback ? criteria.target : 0;
          isEligible = hadComeback;
          break;

        case "NUTRITION_DAYS":
          currentVal = totalNutritionDays;
          isEligible = totalNutritionDays >= criteria.target;
          break;

        case "NUTRITION_WEEKLY":
          currentVal = nutritionCurrentWeekCount;
          isEligible = nutritionCurrentWeekCount >= criteria.target;
          break;

        case "BODY_MEASUREMENTS":
          currentVal = bodyMeasurementsCount;
          isEligible = bodyMeasurementsCount >= criteria.target;
          break;
      }

      if (isEligible) {
        // Award achievement idempotently
        try {
          const awarded = await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: ach.id,
              metadata: {
                metricAtUnlock: currentVal,
                target: criteria.target,
              },
            },
            include: { achievement: true },
          });

          newlyAwarded.push(awarded);

          // Notify Member
          await notificationService.create({
            user: userId,
            title: `Achievement Unlocked: ${ach.title}!`,
            message: `You earned the "${ach.title}" badge: ${ach.description} (+${ach.points} pts)`,
            type: NOTIFICATION_TYPE.ACHIEVEMENT_UNLOCKED,
            category: NOTIFICATION_CATEGORY.ACHIEVEMENT,
            actionUrl: "/gamification",
            metadata: {
              achievementId: ach.id,
              code: ach.code,
              tier: ach.tier,
              badgeIcon: ach.badgeIcon,
              points: ach.points,
            },
          });

          // Check if user has an active Coach to celebrate milestone
          const activeRelationship =
            await prisma.coachMemberRelationship.findFirst({
              where: {
                memberId: userId,
                status: "ACTIVE",
              },
              select: { trainerId: true },
            });

          if (activeRelationship?.trainerId && userRecord?.name) {
            await notificationService.create({
              user: activeRelationship.trainerId,
              title: `Athlete Milestone: ${userRecord.name}`,
              message: `${userRecord.name} just unlocked the "${ach.title}" achievement!`,
              type: NOTIFICATION_TYPE.ACHIEVEMENT_UNLOCKED,
              category: NOTIFICATION_CATEGORY.COACHING,
              actionUrl: `/members/${userId}`,
              metadata: {
                memberId: userId,
                achievementId: ach.id,
                code: ach.code,
              },
            });
          }
        } catch (e: any) {
          // Unique constraint violation P2002 if concurrently created: safely ignore
          if (e.code !== "P2002") {
            console.error("Error awarding achievement:", e);
          }
        }
      }
    }

    return newlyAwarded;
  }

  /**
   * Get complete gamification overview for member (streaks, weekly goal, achievements with progress)
   */
  public async getUserGamificationOverview(userId: string) {
    await this.seedSystemAchievements();
    const newlyAwarded = await this.evaluateUserAchievements(userId);

    const [allAchievements, userAchievements, completedSessions, foodLogs, bodyMeasurementsCount] =
      await Promise.all([
        prisma.achievement.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: { earnedAt: "desc" },
        }),
        prisma.workoutSession.findMany({
          where: {
            memberId: userId,
            status: "COMPLETED",
            isActive: true,
          },
          select: { startedAt: true },
          orderBy: { startedAt: "desc" },
        }),
        prisma.foodLog.findMany({
          where: {
            memberId: userId,
          },
          select: { date: true },
        }),
        prisma.bodyMeasurement.count({
          where: {
            memberId: userId,
            isActive: true,
          },
        }),
      ]);

    const earnedMap = new Map<string, Date>();
    for (const ua of userAchievements) {
      earnedMap.set(ua.achievement.code, ua.earnedAt);
    }

    // Workout Date calculation
    const workoutDateStrings = Array.from(
      new Set(
        completedSessions.map(
          (s) => new Date(s.startedAt).toISOString().split("T")[0],
        ),
      ),
    ).sort((a, b) => b.localeCompare(a));

    const { currentStreak, longestStreak } =
      this.calculateWorkoutStreaks(workoutDateStrings);
    const weeklyWorkouts = this.calculateCurrentWeekWorkouts(workoutDateStrings);
    const weeklyGoalTarget = 4; // Standard recommended weekly target

    const totalNutritionDays = new Set(
      foodLogs.map((fl) => new Date(fl.date).toISOString().split("T")[0]),
    ).size;

    // Map each achievement to include progress and earned status
    const mappedAchievements = allAchievements.map((ach) => {
      const isEarned = earnedMap.has(ach.code);
      const earnedAt = earnedMap.get(ach.code);
      const criteria = ach.criteria as any;

      let currentVal = 0;
      switch (criteria.type) {
        case "COMPLETED_WORKOUTS":
          currentVal = completedSessions.length;
          break;
        case "WORKOUT_STREAK":
          currentVal = Math.max(currentStreak, longestStreak);
          break;
        case "WEEKLY_WORKOUTS":
          currentVal = weeklyWorkouts;
          break;
        case "NUTRITION_DAYS":
          currentVal = totalNutritionDays;
          break;
        case "BODY_MEASUREMENTS":
          currentVal = bodyMeasurementsCount;
          break;
        default:
          currentVal = isEarned ? criteria.target : 0;
      }

      const target = Math.max(0, Number(criteria?.target) || 0);
      const progressPercent = isEarned
        ? 100
        : target > 0
          ? Math.min(100, Math.max(0, Math.round((currentVal / target) * 100)))
          : 0;

      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        name: ach.title, // Standard alias for frontend components
        description: ach.description,
        category: ach.category,
        tier: ach.tier,
        badgeIcon: ach.badgeIcon,
        points: ach.points,
        criteria: ach.criteria,
        criteriaType: (criteria?.type as string) || "",
        criteriaTarget: target, // Standard alias for frontend components
        targetProgress: target,
        displayOrder: ach.displayOrder,
        isEarned,
        earnedAt,
        currentProgress: currentVal,
        progressPct: progressPercent,
        progressPercent, // Standard alias for frontend components
      };
    });

    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + ua.achievement.points,
      0,
    );

    const totalEarned = userAchievements.length;
    const totalAvailable = allAchievements.length;
    const completionRate =
      totalAvailable > 0
        ? Math.min(100, Math.max(0, Math.round((totalEarned / totalAvailable) * 100)))
        : 0;

    return {
      streak: {
        current: currentStreak,
        longest: longestStreak,
        currentStreak,
        longestStreak,
        lastWorkoutDate: workoutDateStrings[0] || null,
        isActiveStreak: currentStreak > 0,
      },
      weeklyGoal: {
        target: weeklyGoalTarget,
        current: weeklyWorkouts,
        isMet: weeklyWorkouts >= weeklyGoalTarget,
        percentage: Math.min(100, Math.round((weeklyWorkouts / weeklyGoalTarget) * 100)),
        targetWorkouts: weeklyGoalTarget,
        completedThisWeek: weeklyWorkouts,
        percent: Math.min(100, Math.round((weeklyWorkouts / weeklyGoalTarget) * 100)),
        weekStartDate: new Date().toISOString(),
      },
      summary: {
        totalPoints,
        unlockedCount: totalEarned,
        totalAchievements: totalAvailable,
        completedWorkouts: completedSessions.length,
        totalEarned,
        totalAvailable,
        completionRate,
      },
      recentAchievements: userAchievements.slice(0, 4).map((ua) => ({
        id: ua.id,
        code: ua.achievement.code,
        title: ua.achievement.title,
        name: ua.achievement.title,
        description: ua.achievement.description,
        category: ua.achievement.category,
        tier: ua.achievement.tier,
        badgeIcon: ua.achievement.badgeIcon,
        points: ua.achievement.points,
        earnedAt: ua.earnedAt,
      })),
      achievements: mappedAchievements,
      newlyUnlocked: newlyAwarded.map((ua) => ({
        id: ua.achievement.id,
        code: ua.achievement.code,
        title: ua.achievement.title,
        name: ua.achievement.title,
        description: ua.achievement.description,
        category: ua.achievement.category,
        tier: ua.achievement.tier,
        badgeIcon: ua.achievement.badgeIcon,
        points: ua.achievement.points,
        earnedAt: ua.earnedAt,
        isEarned: true,
        currentProgress: (ua.achievement.criteria as any)?.target || 0,
        targetProgress: (ua.achievement.criteria as any)?.target || 0,
        criteriaTarget: (ua.achievement.criteria as any)?.target || 0,
        progressPercent: 100,
        progressPct: 100,
      })),
    };
  }

  /**
   * Coach views authorized member's gamification overview
   */
  public async getCoachMemberGamification(
    coachId: string,
    memberId: string,
    isAdmin = false,
  ) {
    if (!isAdmin) {
      const activeRel = await prisma.coachMemberRelationship.findFirst({
        where: {
          trainerId: coachId,
          memberId,
          status: "ACTIVE",
        },
      });

      if (!activeRel) {
        // Also check if assigned
        const assignment = await prisma.assignment.findFirst({
          where: {
            trainerId: coachId,
            memberId,
            isActive: true,
          },
        });

        if (!assignment) {
          throw new AppError(
            "Unauthorized to access this member's gamification details.",
            403,
          );
        }
      }
    }

    return this.getUserGamificationOverview(memberId);
  }

  /**
   * Coach sends encouragement notification to athlete
   */
  public async sendCoachEncouragement(
    coachId: string,
    memberId: string,
    message: string,
    isAdmin = false,
  ) {
    if (!isAdmin) {
      const activeRel = await prisma.coachMemberRelationship.findFirst({
        where: {
          trainerId: coachId,
          memberId,
          status: "ACTIVE",
        },
      });

      if (!activeRel) {
        throw new AppError(
          "You can only send encouragement to athletes with an active coaching relationship.",
          403,
        );
      }
    }

    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { name: true },
    });

    const coachName = coach?.name || "Your Coach";

    return notificationService.create({
      user: memberId,
      title: `Encouragement from Coach ${coachName}`,
      message: message.trim(),
      type: NOTIFICATION_TYPE.COACH_ENCOURAGEMENT,
      category: NOTIFICATION_CATEGORY.COACHING,
      actionUrl: "/dashboard",
      metadata: { coachId },
    });
  }

  // ==========================================
  // HELPER CALCULATIONS
  // ==========================================
  private calculateWorkoutStreaks(dateStrings: string[]) {
    if (dateStrings.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const hasToday = dateStrings.includes(todayStr);
    const hasYesterday = dateStrings.includes(yesterdayStr);

    let currentStreak = 0;
    let longestStreak = 0;

    // If active today or yesterday, streak is currently alive
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? new Date() : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (dateStrings.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate all-time longest streak
    if (dateStrings.length > 0) {
      let tempStreak = 1;
      longestStreak = 1;

      // dates are in descending order
      for (let i = 0; i < dateStrings.length - 1; i++) {
        const curr = new Date(dateStrings[i] + "T00:00:00Z");
        const prev = new Date(dateStrings[i + 1] + "T00:00:00Z");
        const diffDays = Math.round(
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak),
    };
  }

  private calculateCurrentWeekWorkouts(dateStrings: string[]) {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split("T")[0];
    const sundayStr = sunday.toISOString().split("T")[0];

    return dateStrings.filter(
      (d) => d >= mondayStr && d <= sundayStr,
    ).length;
  }

  private checkComeback(sessions: Array<{ startedAt: Date }>) {
    if (sessions.length < 2) return false;

    // sessions are ordered by startedAt desc
    const latest = new Date(sessions[0].startedAt);
    const previous = new Date(sessions[1].startedAt);

    const now = new Date();
    const daysSinceLatest =
      (now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLatest > 7) return false; // Latest session must be recent

    const gapDays =
      (latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
    return gapDays >= 14;
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
