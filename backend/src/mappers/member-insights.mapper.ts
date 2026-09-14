// src/mappers/member-insights.mapper.ts
import type { MemberInsightsMapperInput } from "../types/member-insights.types.js";

export const mapMemberInsights = ({
  kpis,
  charts,
  workoutInsights,
  bodyInsights,
  timeline,
}: MemberInsightsMapperInput) => {
  return {
    kpis: {
      currentWeight: kpis.currentWeight,
      weightDifference: kpis.weightDifference,
      currentBodyFat: kpis.currentBodyFat,
      bodyFatDifference: kpis.bodyFatDifference,
      completionRate: kpis.completionRate,
      totalSessions: kpis.totalSessions,
      completedSessions: kpis.completedSessions,
      averageWorkoutDuration: kpis.averageWorkoutDuration,
      totalWorkoutVolume: kpis.totalWorkoutVolume,
    },
    charts: {
      weight: charts.weight || [],
      bodyFat: charts.bodyFat || [],
      workoutVolume: charts.workoutVolume || [],
      workoutDuration: charts.workoutDuration || [],
    },
    workoutInsights: {
      currentStreak: workoutInsights.currentStreak,
      longestStreak: workoutInsights.longestStreak,
      lastWorkout: workoutInsights.lastWorkout,
      averageRestDays: workoutInsights.averageRestDays,
      workoutFrequency: workoutInsights.workoutFrequency,
      attendancePercentage: workoutInsights.attendancePercentage,
    },
    bodyInsights: {
      weight: bodyInsights.weight,
      bodyFat: bodyInsights.bodyFat,
      chest: bodyInsights.chest,
      waist: bodyInsights.waist,
      hips: bodyInsights.hips,
      shoulders: bodyInsights.shoulders,
      neck: bodyInsights.neck,
      arms: bodyInsights.arms,
      thighs: bodyInsights.thighs,
      calves: bodyInsights.calves,
    },
    timeline: timeline || [],
    ai: {
      summary: null,
      recommendations: [],
    },
  };
};
