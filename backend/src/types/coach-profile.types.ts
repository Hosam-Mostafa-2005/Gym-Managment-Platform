// src/types/coach-profile.types.ts

export interface UpdateCoachProfileDto {
  name?: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  professionalTitle?: string;
  coachingPhilosophy?: string;
  languagesSpoken?: string[];
}

export interface CoachProfileResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    phone?: string | null;
    bio?: string | null;
    specialties: string[];
    certifications: string[];
    yearsOfExperience: number;
    professionalTitle?: string | null;
    coachingPhilosophy?: string | null;
    languagesSpoken?: string[];
    joinedAt: Date;
  };

  overview: {
    activeMembers: number;
    activeAssignments: number;
    workoutsCreated: number;
    completedSessions: number;
    completionRate: number;
    measurementsReviewed: number;
  };

  memberStats: {
    active: number;
    inactive: number;
    newThisMonth: number;
    completedPrograms: number;
  };

  workoutStats: {
    totalCreated: number;
    published: number;
    draft: number;
    archived: number;

    mostAssignedWorkout: {
      id: string;
      title: string;
      count: number;
    } | null;
  };

  charts: {
    sessionsLast30Days: Array<{ date: string; value: number }>;
    membersGrowth: Array<{ date: string; value: number }>;
    completionRateTrend: Array<{ date: string; value: number }>;
  };

  recentActivity: Array<{
    type: string;
    member: { id: string; name: string } | null;
    date: Date;
    action: string;
    metadata: Record<string, any>;
  }>;

  achievements: Array<{
    title: string;
    description: string;
    earned: boolean;
  }>;

  upcomingTasks: Array<{
    type: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    description: string;
    dueDate?: Date;
    member: { id: string; name: string } | null;
  }>;

  ai: {
    summary: null;
  };
}
