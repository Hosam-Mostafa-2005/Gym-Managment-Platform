// src/mappers/coach-profile.mapper.ts
import type { CoachProfileResponse } from "../types/coach-profile.types.js";

export const mapCoachProfile = (data: {
  coach: any;
  overview: any;
  memberStats: any;
  workoutStats: any;
  charts: any;
  recentActivity: any[];
  achievements: any[];
  upcomingTasks: any[];
}): CoachProfileResponse => {
  return {
    profile: {
      id: data.coach._id.toString(),
      name: data.coach.name,
      email: data.coach.email,
      joinedAt: data.coach.createdAt,
    },
    overview: data.overview,
    memberStats: data.memberStats,
    workoutStats: data.workoutStats,
    charts: data.charts,
    recentActivity: data.recentActivity.map((event) => ({
      type: event.type,
      member: event.member
        ? {
            id: event.member._id?.toString() || event.member.id,
            name: event.member.name,
          }
        : null,
      date: event.date,
      action: event.action,
      metadata: event.metadata || {},
    })),
    achievements: data.achievements,
    upcomingTasks: data.upcomingTasks.map((task) => ({
      type: task.type,
      description: task.description,
      dueDate: task.dueDate,
      member: task.member
        ? {
            id: task.member._id?.toString() || task.member.id,
            name: task.member.name,
          }
        : null,
    })),
    ai: {
      summary: null,
    },
  };
};
