// src/features/notifications/types/notifications.types.ts

export type NotificationType =
  | "WORKOUT"
  | "ASSIGNMENT"
  | "MEASUREMENT"
  | "SYSTEM"
  | "COACHING_INVITATION_RECEIVED"
  | "COACHING_INVITATION_ACCEPTED"
  | "COACHING_INVITATION_DECLINED"
  | "COACHING_RELATIONSHIP_TERMINATED"
  | "HISTORY_SHARING_GRANTED"
  | "HISTORY_SHARING_REVOKED"
  | "COACHING_APPOINTMENT_SCHEDULED"
  | "COACHING_APPOINTMENT_CANCELLED"
  | "COACHING_APPOINTMENT_COMPLETED"
  | "COACHING_APPOINTMENT_NO_SHOW"
  | "ACHIEVEMENT_UNLOCKED"
  | "STREAK_MILESTONE"
  | "WEEKLY_GOAL_COMPLETED"
  | "COACH_ENCOURAGEMENT"
  | string;

export type NotificationCategory =
  | "WORKOUT"
  | "NUTRITION"
  | "COACHING"
  | "ACHIEVEMENT"
  | "SYSTEM";

export interface Notification {
  id: string;
  userId?: string;
  user?: string; // backwards compatibility
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: "HIGH" | "NORMAL" | "LOW" | string;
  readAt: string | null;
  isRead?: boolean;
  actionUrl: string | null;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  page: number;
  totalPages: number;
  categoryUnreadCounts?: Record<NotificationCategory | string, number>;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  workoutNotifications: boolean;
  nutritionNotifications: boolean;
  coachingNotifications: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryDto {
  category?: NotificationCategory | "ALL";
  status?: "all" | "unread" | "read";
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}
