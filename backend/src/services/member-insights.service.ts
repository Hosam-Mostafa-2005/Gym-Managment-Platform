// src/services/member-insights.service.ts
import mongoose from "mongoose";
import User from "../models/User.model.js";
import { Assignment } from "../models/Assignment.model.js";
import BodyMeasurement from "../models/BodyMeasurement.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import { mapMemberInsights } from "../mappers/member-insights.mapper.js";

const MAX_HISTORY = 50;

class MemberInsightsService {
  private async checkTrainerAccess(trainerId: string, memberId: string) {
    const isAssigned = await Assignment.exists({
      trainer: trainerId,
      member: memberId,
      isActive: true,
      status: ASSIGNMENT_STATUS.ACTIVE,
    });
    if (!isAssigned) {
      throw new AppError("Member is not assigned to you.", 403);
    }
  }

  private async getWorkoutStats(memberObjectId: mongoose.Types.ObjectId) {
    const statsAgg = await WorkoutSession.aggregate([
      { $match: { member: memberObjectId, isActive: true } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [
                { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                1,
                0,
              ],
            },
          },
          totalDuration: { $sum: "$duration" },
          totalVolume: { $sum: "$totalVolume" },
        },
      },
    ]);
    return statsAgg[0] || null;
  }

  private calculateStreaksAndAverages(dates: Date[]) {
    if (dates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        averageRestDays: 0,
        frequency: 0,
      };
    }

    const uniqueDates = [
      ...new Set(dates.map((d) => d.toISOString().split("T")[0])),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Current streak logic
    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let checkDate = new Date(
        uniqueDates[0] === todayStr ? todayStr : yesterdayStr,
      );
      for (const dateStr of uniqueDates) {
        if (dateStr === checkDate.toISOString().split("T")[0]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak & Average Rest logic
    let totalRestDays = 0;
    let restGaps = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      tempStreak = 1;
      let currDate = new Date(uniqueDates[i]);

      // Count consecutive backwards
      for (let j = i + 1; j < uniqueDates.length; j++) {
        const nextDate = new Date(uniqueDates[j]);
        const diffDays = Math.round(
          (currDate.getTime() - nextDate.getTime()) / (1000 * 3600 * 24),
        );

        if (diffDays === 1) {
          tempStreak++;
          currDate = nextDate;
        } else {
          // Track rest gaps for average
          totalRestDays += diffDays - 1;
          restGaps++;
          break;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    const averageRestDays =
      restGaps > 0 ? Math.round((totalRestDays / restGaps) * 10) / 10 : 0;

    // Frequency (Sessions per week)
    const firstDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const lastDate = new Date(uniqueDates[0]);
    const totalWeeks = Math.max(
      1,
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24 * 7),
    );
    const frequency = Math.round((uniqueDates.length / totalWeeks) * 10) / 10;

    return { currentStreak, longestStreak, averageRestDays, frequency };
  }

  private getLimbTotal(
    measurement: any,
    leftKey: string,
    rightKey: string,
  ): number {
    if (!measurement || !measurement.circumferences) return 0;
    const left = measurement.circumferences[leftKey] || 0;
    const right = measurement.circumferences[rightKey] || 0;
    return left + right;
  }

  private buildBodyInsights(
    latestMeasurement: any,
    previousMeasurement: any,
    kpis: any,
  ) {
    return {
      weight: kpis.weightDifference,
      bodyFat: kpis.bodyFatDifference,
      chest:
        (latestMeasurement?.circumferences?.chest || 0) -
        (previousMeasurement?.circumferences?.chest || 0),

      waist:
        (latestMeasurement?.circumferences?.waist || 0) -
        (previousMeasurement?.circumferences?.waist || 0),

      hips:
        (latestMeasurement?.circumferences?.hips || 0) -
        (previousMeasurement?.circumferences?.hips || 0),

      shoulders:
        (latestMeasurement?.circumferences?.shoulders || 0) -
        (previousMeasurement?.circumferences?.shoulders || 0),

      neck:
        (latestMeasurement?.circumferences?.neck || 0) -
        (previousMeasurement?.circumferences?.neck || 0),

      arms:
        this.getLimbTotal(latestMeasurement, "leftArm", "rightArm") -
        this.getLimbTotal(previousMeasurement, "leftArm", "rightArm"),

      thighs:
        this.getLimbTotal(latestMeasurement, "leftThigh", "rightThigh") -
        this.getLimbTotal(previousMeasurement, "leftThigh", "rightThigh"),

      calves:
        this.getLimbTotal(latestMeasurement, "leftCalf", "rightCalf") -
        this.getLimbTotal(previousMeasurement, "leftCalf", "rightCalf"),
    };
  }

  private buildCharts(measurements: any[], completedSessions: any[]) {
    const measurementsAsc = [...measurements].reverse();
    const sessionsAsc = [...completedSessions].reverse();

    return {
      weight: measurementsAsc.map((m) => ({
        date: m.measuredAt.toISOString().split("T")[0],
        value: m.weight,
      })),
      bodyFat: measurementsAsc
        .filter((m) => m.bodyFat != null)
        .map((m) => ({
          date: m.measuredAt.toISOString().split("T")[0],
          value: m.bodyFat,
        })),
      workoutVolume: sessionsAsc.map((s) => ({
        date: s.startedAt?.toISOString().split("T")[0] || "",
        value: s.totalVolume,
      })),
      workoutDuration: sessionsAsc.map((s) => ({
        date: s.startedAt?.toISOString().split("T")[0] || "",
        value: s.duration,
      })),
    };
  }

  private buildTimeline(
    measurements: any[],
    sessions: any[],
    assignments: any[],
  ) {
    const timelineEvents: any[] = [];

    measurements.forEach((m) => {
      timelineEvents.push({
        type: "BODY_MEASUREMENT_RECORDED",
        title: "Body Measurement Recorded",
        description: "A new body measurement was logged.",
        date: m.measuredAt || m.createdAt,
      });
    });

    sessions.forEach((s) => {
      const title = (s.assignment as any)?.workout?.title || "Unknown Workout";
      if (s.startedAt) {
        timelineEvents.push({
          type: "WORKOUT_STARTED",
          title: "Workout Started",
          description: `Started "${title}"`,
          date: s.startedAt,
        });
      }
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED && s.endedAt) {
        timelineEvents.push({
          type: "WORKOUT_COMPLETED",
          title: "Workout Completed",
          description: `Completed "${title}"`,
          date: s.endedAt,
        });
      }
    });

    assignments.forEach((a) => {
      const title = (a.workout as any)?.title || "Unknown Workout";
      timelineEvents.push({
        type: "WORKOUT_ASSIGNED",
        title: "Workout Assigned",
        description: `Assigned to "${title}"`,
        date: a.createdAt,
      });
      if (a.status === ASSIGNMENT_STATUS.COMPLETED && a.completedAt) {
        timelineEvents.push({
          type: "ASSIGNMENT_COMPLETED",
          title: "Assignment Completed",
          description: `Finished the "${title}" program`,
          date: a.completedAt,
        });
      }
      if (a.status === ASSIGNMENT_STATUS.CANCELLED && a.cancelledAt) {
        timelineEvents.push({
          type: "ASSIGNMENT_CANCELLED",
          title: "Assignment Cancelled",
          description: `Cancelled the "${title}" program`,
          date: a.cancelledAt,
        });
      }
    });

    timelineEvents.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return b.date.getTime() - a.date.getTime();
    });

    return timelineEvents;
  }

  async getInsights(memberId: string, userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, memberId);
    }

    const memberObjectId = new mongoose.Types.ObjectId(memberId);
    const member = await User.findOne({ _id: memberObjectId, isActive: true });

    if (!member || member.role !== Roles.MEMBER) {
      throw new AppError("Member not found.", 404);
    }

    // 1. Parallel Database Queries
    const [stats, measurements, sessions, assignments] = await Promise.all([
      this.getWorkoutStats(memberObjectId),

      BodyMeasurement.find({ member: memberObjectId, isActive: true })
        .sort({ measuredAt: -1 })
        .limit(MAX_HISTORY),

      WorkoutSession.find({ member: memberObjectId, isActive: true })
        .select("status duration totalVolume startedAt endedAt assignment")
        .sort({ startedAt: -1 })
        .populate({
          path: "assignment",
          select: "workout",
          populate: { path: "workout", select: "title" },
        }),

      Assignment.find({ member: memberObjectId, isActive: true })
        .select("status createdAt completedAt cancelledAt workout")
        .populate("workout", "title"),
    ]);

    // 2. Compute KPIs
    const latestMeasurement = measurements[0] || null;
    const previousMeasurement = measurements[1] || null;

    const completionRate =
      stats && stats.totalSessions > 0
        ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
        : 0;

    const averageWorkoutDuration =
      stats && stats.completedSessions > 0
        ? Math.round(stats.totalDuration / stats.completedSessions)
        : 0;

    const kpis = {
      currentWeight: latestMeasurement?.weight || 0,
      weightDifference:
        latestMeasurement && previousMeasurement
          ? Math.round(
              (latestMeasurement.weight - previousMeasurement.weight) * 10,
            ) / 10
          : 0,
      currentBodyFat: latestMeasurement?.bodyFat || 0,
      bodyFatDifference:
        latestMeasurement?.bodyFat != null &&
        previousMeasurement?.bodyFat != null
          ? Math.round(
              (latestMeasurement.bodyFat - previousMeasurement.bodyFat) * 10,
            ) / 10
          : 0,
      completionRate,
      totalSessions: stats?.totalSessions || 0,
      completedSessions: stats?.completedSessions || 0,
      averageWorkoutDuration,
      totalWorkoutVolume: stats?.totalVolume || 0,
    };

    // 3. Compute Body Insights (Deltas)
    const bodyInsights = this.buildBodyInsights(
      latestMeasurement,
      previousMeasurement,
      kpis,
    );

    // 4. Compute Workout Insights
    const completedSessions = sessions.filter(
      (s) => s.status === WORKOUT_SESSION_STATUS.COMPLETED,
    );
    const sessionDates = completedSessions
      .map((s) => s.startedAt)
      .filter(Boolean) as Date[];
    const streaksAndAverages = this.calculateStreaksAndAverages(sessionDates);

    const workoutInsights = {
      currentStreak: streaksAndAverages.currentStreak,
      longestStreak: streaksAndAverages.longestStreak,
      lastWorkout: sessionDates.length > 0 ? sessionDates[0] : null,
      averageRestDays: streaksAndAverages.averageRestDays,
      workoutFrequency: streaksAndAverages.frequency,
      attendancePercentage: completionRate, // Attendance is derived from completion in this context
    };

    // 5. Construct Charts (Chronological order)
    const charts = this.buildCharts(measurements, completedSessions);

    // 6. Construct Timeline
    const timelineEvents = this.buildTimeline(
      measurements,
      sessions,
      assignments,
    );

    // 7. Map and Return
    return mapMemberInsights({
      kpis,
      charts,
      workoutInsights,
      bodyInsights,
      timeline: timelineEvents.slice(0, MAX_HISTORY),
    });
  }
}

export default new MemberInsightsService();
