import { NOTIFICATION_TYPE } from "../../constants/notification.js";

export interface RawNotification {
  user: any; // ObjectId
  title: string;
  message: string;
  type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
  read: boolean;
  readAt?: Date;
  actionUrl: string;
  metadata?: Record<string, any>;
  isActive: boolean;
}

export const generateNotificationsData = (
  users: any[],
  assignments: any[],
  workoutSessions: any[],
  bodyMeasurements: any[],
): RawNotification[] => {
  const notifications: RawNotification[] = [];
  const now = new Date();

  const actionUrls = [
    "/dashboard",
    "/workouts",
    "/assignments",
    "/body-measurements",
  ];

  // Helper to create a notification object
  const createNotification = (
    userId: any,
    title: string,
    message: string,
    type: any,
    actionUrl: string,
    metadata?: Record<string, any>,
    createdAtOffsetDays: number = 5,
  ) => {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - createdAtOffsetDays);

    const isRead = (userId.toString().length + createdAtOffsetDays) % 10 < 6; // ~60% read
    let readAt: Date | undefined = undefined;

    if (isRead) {
      readAt = new Date(createdAt);
      readAt.setHours(readAt.getHours() + 2);
    }

    return {
      user: userId,
      title,
      message,
      type,
      read: isRead,
      readAt,
      actionUrl,
      metadata,
      isActive: true,
    };
  };

  // 1. Generate System Welcome Notifications for ALL users
  users.forEach((user, index) => {
    notifications.push(
      createNotification(
        user._id,
        "Welcome",
        "Welcome to Gym Management Platform.",
        NOTIFICATION_TYPE.SYSTEM,
        "/dashboard",
        undefined,
        45 + (index % 10),
      ),
    );
  });

  // 2. Generate Assignment Notifications
  assignments.forEach((assignment, index) => {
    const memberId = assignment.member;
    const trainerId = assignment.trainer;

    // Assignment Created (to member)
    notifications.push(
      createNotification(
        memberId,
        "New Workout Assigned",
        "Your trainer assigned a new workout program.",
        NOTIFICATION_TYPE.ASSIGNMENT_CREATED,
        `/assignments/${assignment._id}`,
        { assignmentId: assignment._id, workoutId: assignment.workout },
        30 + (index % 15),
      ),
    );

    // Assignment Updated or Cancelled occasionally
    if (index % 4 === 0) {
      notifications.push(
        createNotification(
          memberId,
          "Workout Assignment Updated",
          "Your workout assignment has been updated.",
          NOTIFICATION_TYPE.ASSIGNMENT_UPDATED,
          `/assignments/${assignment._id}`,
          { assignmentId: assignment._id },
          15 + (index % 5),
        ),
      );
    } else if (index % 10 === 0) {
      notifications.push(
        createNotification(
          memberId,
          "Workout Assignment Cancelled",
          "Your assignment has been cancelled.",
          NOTIFICATION_TYPE.ASSIGNMENT_CANCELLED,
          `/assignments/${assignment._id}`,
          { assignmentId: assignment._id },
          10,
        ),
      );
    }
  });

  // 3. Generate Workout Session Notifications
  workoutSessions.forEach((session, index) => {
    const memberId = session.member;

    // Workout Started (to member)
    notifications.push(
      createNotification(
        memberId,
        "Workout Started",
        "Your workout session has started.",
        NOTIFICATION_TYPE.WORKOUT_STARTED,
        `/workout-sessions/${session._id}`,
        { sessionId: session._id },
        20 - (index % 15),
      ),
    );

    // Workout Completed (to member & trainer if possible)
    if (session.status === "COMPLETED") {
      notifications.push(
        createNotification(
          memberId,
          "Workout Completed",
          "Great job completing today's workout.",
          NOTIFICATION_TYPE.WORKOUT_COMPLETED,
          `/workout-sessions/${session._id}`,
          { sessionId: session._id },
          19 - (index % 15),
        ),
      );
    }
  });

  // 4. Generate Body Measurement Notifications
  bodyMeasurements.forEach((measurement, index) => {
    const memberId = measurement.member;
    const trainerId = measurement.trainer;

    // Measurement Created (to member)
    notifications.push(
      createNotification(
        memberId,
        "Measurement Recorded",
        "Your coach recorded new body measurements.",
        NOTIFICATION_TYPE.BODY_MEASUREMENT_CREATED,
        `/body-measurements/${measurement._id}`,
        { measurementId: measurement._id },
        12 - (index % 10),
      ),
    );

    // Measurement Updated / Deleted occasionally for trainers/members
    if (index % 5 === 0 && trainerId) {
      notifications.push(
        createNotification(
          trainerId,
          "Body Measurement Updated",
          "A body measurement record was modified.",
          NOTIFICATION_TYPE.BODY_MEASUREMENT_UPDATED,
          `/body-measurements/${measurement._id}`,
          { measurementId: measurement._id },
          5,
        ),
      );
    }
  });

  return notifications;
};
