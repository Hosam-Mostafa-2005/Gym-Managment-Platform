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
      id: data.coach.id || data.coach._id?.toString(),
      name: data.coach.name,
      email: data.coach.email,
      avatarUrl: data.coach.avatarUrl ?? null,

      phone: data.coach.phone ?? null,

      bio: data.coach.bio ?? null,

      specialties: Array.isArray(data.coach.specialties)
        ? data.coach.specialties
        : [],

      certifications: Array.isArray(data.coach.certifications)
        ? data.coach.certifications
        : [],

      yearsOfExperience: data.coach.yearsOfExperience ?? 0,

      professionalTitle: data.coach.professionalTitle ?? null,
      coachingPhilosophy: data.coach.coachingPhilosophy ?? null,
      languagesSpoken: Array.isArray(data.coach.languagesSpoken)
        ? data.coach.languagesSpoken
        : [],

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
            id: event.member.id || event.member._id?.toString(),
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
      title: task.title,
      priority: task.priority,
      description: task.description,
      dueDate: task.dueDate,
      member: task.member
        ? {
            id: task.member.id || task.member._id?.toString(),
            name: task.member.name,
          }
        : null,
    })),
    ai: {
      summary: null,
    },
  };
};
