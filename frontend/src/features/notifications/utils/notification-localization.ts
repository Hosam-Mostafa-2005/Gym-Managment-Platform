// src/features/notifications/utils/notification-localization.ts

import type { Notification } from "../types/notifications.types";

export interface LocalizedNotificationContent {
  title: string;
  message: string;
}

/**
 * Localizes a notification's title and message according to the currently active language.
 * Dynamically preserves user data (athlete names, coach names, workout titles, custom messages, points).
 */
export const localizeNotification = (
  notification: Notification,
  t: (key: any, options?: any) => string,
  lang: string
): LocalizedNotificationContent => {
  const isArabic = lang.startsWith("ar");

  if (!isArabic) {
    return {
      title: notification.title,
      message: notification.message,
    };
  }

  const type = notification.type?.toUpperCase() || "";
  const rawTitle = notification.title || "";
  const rawMessage = notification.message || "";
  const metadata = (notification.metadata as Record<string, any>) || {};

  switch (type) {
    case "ASSIGNMENT_CREATED": {
      return {
        title: t("notifications:messages.ASSIGNMENT_CREATED.title"),
        message: t("notifications:messages.ASSIGNMENT_CREATED.message"),
      };
    }

    case "ASSIGNMENT_UPDATED": {
      return {
        title: t("notifications:messages.ASSIGNMENT_UPDATED.title"),
        message: t("notifications:messages.ASSIGNMENT_UPDATED.message"),
      };
    }

    case "ASSIGNMENT_CANCELLED": {
      return {
        title: t("notifications:messages.ASSIGNMENT_CANCELLED.title"),
        message: t("notifications:messages.ASSIGNMENT_CANCELLED.message"),
      };
    }

    case "WORKOUT_STARTED": {
      if (rawMessage.includes("started \"") || metadata.memberName) {
        const match = rawMessage.match(/(.*?) started "(.*?)"/i);
        const memberName = metadata.memberName || match?.[1] || "العضو";
        const workoutTitle = metadata.workoutTitle || match?.[2] || "التمرين";
        return {
          title: t("notifications:messages.WORKOUT_STARTED.coachTitle"),
          message: t("notifications:messages.WORKOUT_STARTED.coachMessage", {
            memberName,
            workoutTitle,
          }),
        };
      }
      return {
        title: t("notifications:messages.WORKOUT_STARTED.memberTitle"),
        message: t("notifications:messages.WORKOUT_STARTED.memberMessage"),
      };
    }

    case "WORKOUT_COMPLETED": {
      // Member notification format: "Great job! You completed..."
      if (
        rawMessage.includes("Great job") ||
        rawMessage.includes("today's workout") ||
        metadata.forMember
      ) {
        const match = rawMessage.match(
          /completed "(.*?)"(?: in (\d+) minutes)?/i
        );
        if (match && match[1]) {
          const workoutTitle = match[1];
          const duration = match[2];
          if (duration) {
            return {
              title: t("notifications:messages.WORKOUT_COMPLETED.memberTitle"),
              message: t(
                "notifications:messages.WORKOUT_COMPLETED.memberMessageWithDuration",
                { workoutTitle, duration }
              ),
            };
          }
          return {
            title: t("notifications:messages.WORKOUT_COMPLETED.memberTitle"),
            message: t(
              "notifications:messages.WORKOUT_COMPLETED.memberMessage",
              { workoutTitle }
            ),
          };
        }
        return {
          title: t("notifications:messages.WORKOUT_COMPLETED.memberTitle"),
          message: t(
            "notifications:messages.WORKOUT_COMPLETED.genericMemberMessage"
          ),
        };
      }

      // Coach notification format: "Member completed 'Workout' in X minutes."
      const match = rawMessage.match(/(.*?) completed "(.*?)" in (\d+) minutes/i);
      const memberName = metadata.memberName || match?.[1] || "العضو";
      const workoutTitle = metadata.workoutTitle || match?.[2] || "التمرين";
      const duration = metadata.duration || match?.[3] || "";
      return {
        title: t("notifications:messages.WORKOUT_COMPLETED.coachTitle"),
        message: t("notifications:messages.WORKOUT_COMPLETED.coachMessage", {
          memberName,
          workoutTitle,
          duration,
        }),
      };
    }

    case "WORKOUT_SCHEDULED": {
      const match = rawMessage.match(/Coach (.*?) scheduled "(.*?)" for (.*?)\.?$/i);
      const coachName = metadata.coachName || match?.[1] || "المدرب";
      const workoutTitle = metadata.workoutTitle || match?.[2] || "التمرين";
      const date = metadata.date || match?.[3] || "";
      return {
        title: t("notifications:messages.WORKOUT_SCHEDULED.title"),
        message: t("notifications:messages.WORKOUT_SCHEDULED.message", {
          coachName,
          workoutTitle,
          date,
        }),
      };
    }

    case "WORKOUT_SCHEDULE_UPDATED": {
      const match = rawMessage.match(
        /Coach (.*?) rescheduled your workout "(.*?)" to (.*?)\.?$/i
      );
      const coachName = metadata.coachName || match?.[1] || "المدرب";
      const workoutTitle = metadata.workoutTitle || match?.[2] || "التمرين";
      const date = metadata.date || match?.[3] || "";
      return {
        title: t("notifications:messages.WORKOUT_SCHEDULE_UPDATED.title"),
        message: t("notifications:messages.WORKOUT_SCHEDULE_UPDATED.message", {
          coachName,
          workoutTitle,
          date,
        }),
      };
    }

    case "WORKOUT_SCHEDULE_CANCELLED": {
      const match = rawMessage.match(
        /Coach (.*?) cancelled the scheduled workout "(.*?)"/i
      );
      const coachName = metadata.coachName || match?.[1] || "المدرب";
      const workoutTitle = metadata.workoutTitle || match?.[2] || "التمرين";
      return {
        title: t("notifications:messages.WORKOUT_SCHEDULE_CANCELLED.title"),
        message: t("notifications:messages.WORKOUT_SCHEDULE_CANCELLED.message", {
          coachName,
          workoutTitle,
        }),
      };
    }

    case "NUTRITION_PLAN_ASSIGNED": {
      const match = rawMessage.match(/plan: "(.*?)" \((\d+) kcal\)/i);
      const name = metadata.name || match?.[1] || "الخطة الغذائية";
      const calories = metadata.targetCalories || match?.[2] || "";
      return {
        title: t("notifications:messages.NUTRITION_PLAN_ASSIGNED.title"),
        message: t("notifications:messages.NUTRITION_PLAN_ASSIGNED.message", {
          name,
          calories,
        }),
      };
    }

    case "NUTRITION_PLAN_UPDATED": {
      return {
        title: t("notifications:messages.NUTRITION_PLAN_UPDATED.title"),
        message: t("notifications:messages.NUTRITION_PLAN_UPDATED.message"),
      };
    }

    case "BODY_MEASUREMENT_CREATED": {
      return {
        title: t("notifications:messages.BODY_MEASUREMENT_CREATED.title"),
        message: t("notifications:messages.BODY_MEASUREMENT_CREATED.message"),
      };
    }

    case "BODY_MEASUREMENT_UPDATED": {
      return {
        title: t("notifications:messages.BODY_MEASUREMENT_UPDATED.title"),
        message: t("notifications:messages.BODY_MEASUREMENT_UPDATED.message"),
      };
    }

    case "BODY_MEASUREMENT_DELETED": {
      return {
        title: t("notifications:messages.BODY_MEASUREMENT_DELETED.title"),
        message: t("notifications:messages.BODY_MEASUREMENT_DELETED.message"),
      };
    }

    case "COACHING_INVITATION_RECEIVED": {
      const match = rawMessage.match(/Coach (.*?) has invited you/i);
      const coachName = metadata.trainerName || match?.[1] || "المدرب";
      return {
        title: t("notifications:messages.COACHING_INVITATION_RECEIVED.title"),
        message: t("notifications:messages.COACHING_INVITATION_RECEIVED.message", {
          coachName,
        }),
      };
    }

    case "COACHING_INVITATION_ACCEPTED": {
      const match = rawMessage.match(/(.*?) accepted your coaching invitation/i);
      const memberName = metadata.memberName || match?.[1] || "الرياضي";
      return {
        title: t("notifications:messages.COACHING_INVITATION_ACCEPTED.title"),
        message: t("notifications:messages.COACHING_INVITATION_ACCEPTED.message", {
          memberName,
        }),
      };
    }

    case "COACHING_INVITATION_DECLINED": {
      const match = rawMessage.match(/(.*?) declined your coaching invitation/i);
      const memberName = metadata.memberName || match?.[1] || "الرياضي";
      return {
        title: t("notifications:messages.COACHING_INVITATION_DECLINED.title"),
        message: t("notifications:messages.COACHING_INVITATION_DECLINED.message", {
          memberName,
        }),
      };
    }

    case "COACHING_RELATIONSHIP_TERMINATED": {
      const match = rawMessage.match(
        /(.*?) has ended the coaching relationship/i
      );
      const initiatorName = match?.[1] || "الطرف الآخر";
      return {
        title: t("notifications:messages.COACHING_RELATIONSHIP_TERMINATED.title"),
        message: t(
          "notifications:messages.COACHING_RELATIONSHIP_TERMINATED.message",
          { initiatorName }
        ),
      };
    }

    case "HISTORY_SHARING_GRANTED": {
      const match = rawMessage.match(/(.*?) has granted you access/i);
      const memberName = match?.[1] || "الرياضي";
      return {
        title: t("notifications:messages.HISTORY_SHARING_GRANTED.title"),
        message: t("notifications:messages.HISTORY_SHARING_GRANTED.message", {
          memberName,
        }),
      };
    }

    case "HISTORY_SHARING_REVOKED": {
      const match = rawMessage.match(/(.*?) has revoked access/i);
      const memberName = match?.[1] || "الرياضي";
      return {
        title: t("notifications:messages.HISTORY_SHARING_REVOKED.title"),
        message: t("notifications:messages.HISTORY_SHARING_REVOKED.message", {
          memberName,
        }),
      };
    }

    case "COACHING_APPOINTMENT_SCHEDULED": {
      const match = rawMessage.match(
        /Coach (.*?) scheduled a "(.*?)" \((.*?)\) appointment for (.*?)\.?$/i
      );
      const coachName = match?.[1] || "المدرب";
      const apptTitle = match?.[2] || "موعد";
      const apptType = match?.[3] || "";
      const date = match?.[4] || "";
      return {
        title: t("notifications:messages.COACHING_APPOINTMENT_SCHEDULED.title"),
        message: t(
          "notifications:messages.COACHING_APPOINTMENT_SCHEDULED.message",
          { coachName, title: apptTitle, type: apptType, date }
        ),
      };
    }

    case "COACHING_APPOINTMENT_RESCHEDULED": {
      const match = rawMessage.match(
        /Coach (.*?) rescheduled your appointment "(.*?)" to (.*?)\.?$/i
      );
      const coachName = match?.[1] || "المدرب";
      const apptTitle = match?.[2] || "موعد";
      const date = match?.[3] || "";
      return {
        title: t(
          "notifications:messages.COACHING_APPOINTMENT_RESCHEDULED.title"
        ),
        message: t(
          "notifications:messages.COACHING_APPOINTMENT_RESCHEDULED.message",
          { coachName, title: apptTitle, date }
        ),
      };
    }

    case "COACHING_APPOINTMENT_CANCELLED": {
      const match = rawMessage.match(
        /(.*?) cancelled the appointment "(.*?)". Reason: (.*?)$/i
      );
      const cancelledByName = match?.[1] || "الطرف الآخر";
      const apptTitle = match?.[2] || "موعد";
      const reason = match?.[3] || "";
      return {
        title: t("notifications:messages.COACHING_APPOINTMENT_CANCELLED.title"),
        message: t(
          "notifications:messages.COACHING_APPOINTMENT_CANCELLED.message",
          { cancelledByName, title: apptTitle, reason }
        ),
      };
    }

    case "COACHING_APPOINTMENT_COMPLETED": {
      return {
        title: t("notifications:messages.COACHING_APPOINTMENT_COMPLETED.title"),
        message: t(
          "notifications:messages.COACHING_APPOINTMENT_COMPLETED.message"
        ),
      };
    }

    case "COACHING_APPOINTMENT_NO_SHOW": {
      return {
        title: t("notifications:messages.COACHING_APPOINTMENT_NO_SHOW.title"),
        message: t("notifications:messages.COACHING_APPOINTMENT_NO_SHOW.message"),
      };
    }

    case "ACHIEVEMENT_UNLOCKED": {
      if (
        rawMessage.includes("You earned the") ||
        rawTitle.startsWith("Achievement Unlocked")
      ) {
        const match = rawMessage.match(
          /earned the "(.*?)" badge: (.*?) \(\+(\d+) pts\)/i
        );
        const achTitle = match?.[1] || metadata.code || "إنجاز";
        const achDesc = match?.[2] || "";
        const points = match?.[3] || 0;
        return {
          title: t("notifications:messages.ACHIEVEMENT_UNLOCKED.memberTitle", {
            achTitle,
          }),
          message: t(
            "notifications:messages.ACHIEVEMENT_UNLOCKED.memberMessage",
            { achTitle, achDesc, points }
          ),
        };
      }
      const match = rawMessage.match(/(.*?) just unlocked the "(.*?)" achievement/i);
      const memberName = match?.[1] || "الرياضي";
      const achTitle = match?.[2] || "إنجاز";
      return {
        title: t("notifications:messages.ACHIEVEMENT_UNLOCKED.coachTitle", {
          memberName,
        }),
        message: t("notifications:messages.ACHIEVEMENT_UNLOCKED.coachMessage", {
          memberName,
          achTitle,
        }),
      };
    }

    case "STREAK_MILESTONE": {
      const match = rawMessage.match(/(\d+) consecutive days/i);
      const count = match?.[1] || 1;
      return {
        title: t("notifications:messages.STREAK_MILESTONE.title"),
        message: t("notifications:messages.STREAK_MILESTONE.message", {
          count,
        }),
      };
    }

    case "WEEKLY_GOAL_COMPLETED": {
      return {
        title: t("notifications:messages.WEEKLY_GOAL_COMPLETED.title"),
        message: t("notifications:messages.WEEKLY_GOAL_COMPLETED.message"),
      };
    }

    case "COACH_ENCOURAGEMENT": {
      if (rawTitle.includes("Coach Feedback")) {
        const match = rawMessage.match(/(.*?) reviewed your workout/i);
        const coachName = match?.[1] || "المدرب";
        return {
          title: t("notifications:messages.COACH_ENCOURAGEMENT.feedbackTitle"),
          message: t(
            "notifications:messages.COACH_ENCOURAGEMENT.feedbackMessage",
            { coachName }
          ),
        };
      }
      const match = rawTitle.match(/Coach (.*)/i);
      const coachName = match?.[1] || "المدرب";
      return {
        title: t("notifications:messages.COACH_ENCOURAGEMENT.cheerTitle", {
          coachName,
        }),
        message: rawMessage, // Preserve coach's exact personalized encouragement note
      };
    }

    case "SYSTEM": {
      if (rawTitle === "Welcome") {
        return {
          title: t("notifications:messages.SYSTEM.welcomeTitle"),
          message: t("notifications:messages.SYSTEM.welcomeMessage"),
        };
      }
      return {
        title: rawTitle,
        message: rawMessage,
      };
    }

    default: {
      return {
        title: rawTitle,
        message: rawMessage,
      };
    }
  }
};

/**
 * Formats relative timestamp strings in a locale-aware manner.
 */
export const formatNotificationTimeAgo = (
  dateString: string,
  t: (key: any, options?: any) => string,
  lang: string
): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return t("notifications:timeAgo.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return t("notifications:timeAgo.minutesAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return t("notifications:timeAgo.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7)
    return t("notifications:timeAgo.daysAgo", { count: days });
  return new Intl.DateTimeFormat(lang.startsWith("ar") ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};
