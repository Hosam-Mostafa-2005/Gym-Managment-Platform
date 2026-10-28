// src/services/scheduled-workout.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { Roles } from "../constants/roles.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import workoutSessionService from "./workout-session.service.js";

export interface CreateScheduledWorkoutInput {
  workoutId: string;
  scheduledAt: string;
  assignmentId?: string;
  notes?: string;
}

export interface CreateCoachScheduledInput {
  memberId: string;
  workoutId: string;
  scheduledAt: string;
  assignmentId?: string;
  notes?: string;
}

export interface UpdateScheduledWorkoutInput {
  scheduledAt?: string;
  notes?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED" | "RESCHEDULED";
}

export interface UpdateCoachScheduledInput {
  scheduledAt?: string;
  notes?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED" | "RESCHEDULED";
}

class ScheduledWorkoutService {
  /**
   * Helper to verify coach authorization via CoachMemberRelationship
   */
  public async verifyCoachingRelationship(
    trainerId: string,
    memberId: string,
    isAdmin = false,
  ) {
    if (isAdmin) return true;

    const rel = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId,
        status: "ACTIVE",
        isActive: true,
      },
    });

    if (!rel) {
      throw new AppError(
        "Unauthorized: You can only manage workout schedules for members with an active coaching relationship.",
        403,
      );
    }

    return true;
  }

  /**
   * Member self-schedules a workout
   */
  async create(memberId: string, data: CreateScheduledWorkoutInput) {
    const { workoutId, scheduledAt, assignmentId, notes } = data;

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new AppError("Invalid scheduled date format.", 400);
    }

    let resolvedAssignmentId: string | null = null;

    if (assignmentId) {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          memberId,
          isActive: true,
        },
      });

      if (!assignment) {
        throw new AppError("Assignment not found or unauthorized.", 404);
      }

      if (assignment.status !== ASSIGNMENT_STATUS.ACTIVE) {
        throw new AppError("Assignment is not active.", 400);
      }

      if (assignment.workoutId !== workoutId) {
        throw new AppError(
          "The specified workout does not match this assignment.",
          400,
        );
      }

      resolvedAssignmentId = assignment.id;
    }

    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!workout || !workout.isActive) {
      throw new AppError("Workout not found.", 404);
    }

    // Authorization check for independent member scheduling
    if (!resolvedAssignmentId && workout.createdBy !== memberId && !workout.isTemplate) {
      throw new AppError("You are not allowed to schedule this workout.", 403);
    }

    const scheduled = await prisma.scheduledWorkout.create({
      data: {
        memberId,
        workoutId,
        assignmentId: resolvedAssignmentId,
        scheduledAt: scheduledDate,
        notes: notes?.trim() || null,
        status: "SCHEDULED",
      },
      include: {
        member: { select: { id: true, name: true, email: true, avatarUrl: true } },
        trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        assignment: {
          include: {
            trainer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return scheduled;
  }

  /**
   * Coach schedules a workout for an authorized member
   */
  async createCoachScheduled(
    trainerId: string,
    data: CreateCoachScheduledInput,
    isAdmin = false,
  ) {
    await this.verifyCoachingRelationship(trainerId, data.memberId, isAdmin);

    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new AppError("Invalid scheduled date format.", 400);
    }

    let resolvedAssignmentId: string | null = null;

    if (data.assignmentId) {
      const assignment = await prisma.assignment.findFirst({
        where: {
          id: data.assignmentId,
          memberId: data.memberId,
          isActive: true,
        },
      });

      if (!assignment) {
        throw new AppError("Assignment not found.", 404);
      }
      resolvedAssignmentId = assignment.id;
    }

    const workout = await prisma.workout.findUnique({
      where: { id: data.workoutId },
    });

    if (!workout || !workout.isActive) {
      throw new AppError("Workout not found.", 404);
    }

    const coach = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { name: true },
    });

    const scheduled = await prisma.$transaction(async (tx) => {
      const created = await tx.scheduledWorkout.create({
        data: {
          memberId: data.memberId,
          trainerId,
          workoutId: data.workoutId,
          assignmentId: resolvedAssignmentId,
          scheduledAt: scheduledDate,
          notes: data.notes?.trim() || null,
          status: "SCHEDULED",
        },
        include: {
          workout: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
              },
            },
          },
          member: { select: { id: true, name: true, email: true, avatarUrl: true } },
        trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      });

      // Send notification to member
      await tx.notification.create({
        data: {
          userId: data.memberId,
          title: "New Workout Scheduled",
          message: `Coach ${coach?.name || "Your Coach"} scheduled "${workout.title}" for ${scheduledDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}.`,
          type: (NOTIFICATION_TYPE as any).WORKOUT_SCHEDULED || "SYSTEM",
          actionUrl: "/calendar",
        },
      });

      return created;
    });

    return scheduled;
  }

  /**
   * Member retrieves scheduled workouts with date range and missed classification
   */
  async getAll(
    memberId: string,
    query?: {
      status?: string;
      upcomingOnly?: string;
      from?: string;
      to?: string;
    },
  ) {
    const where: any = {
      memberId,
      isActive: true,
    };

    if (query?.status) {
      where.status = query.status.toUpperCase();
    }

    if (query?.upcomingOnly === "true") {
      where.scheduledAt = {
        gte: new Date(Date.now() - 60 * 60 * 1000), // within the last hour or in future
      };
      where.status = "SCHEDULED";
    } else if (query?.from || query?.to) {
      where.scheduledAt = {};
      if (query.from) where.scheduledAt.gte = new Date(query.from);
      if (query.to) where.scheduledAt.lte = new Date(query.to);
    }

    const scheduledList = await prisma.scheduledWorkout.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        member: { select: { id: true, name: true, email: true, avatarUrl: true } },
        trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        assignment: {
          include: {
            trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        session: {
          select: {
            id: true,
            status: true,
            duration: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
    });

    // Derive MISSED status: if status is SCHEDULED and time is in past by > 2 hours and no session
    const now = Date.now();
    return scheduledList.map((sw) => {
      const isPast = now - new Date(sw.scheduledAt).getTime() > 2 * 60 * 60 * 1000;
      let effectiveStatus = sw.status;
      if (sw.status === "SCHEDULED" && isPast && (!sw.session || sw.session.status !== "COMPLETED")) {
        effectiveStatus = "MISSED" as any;
      }
      return {
        ...sw,
        status: effectiveStatus,
      };
    });
  }

  /**
   * Coach retrieves scheduled workouts across authorized athletes
   */
  async getCoachScheduledWorkouts(
    trainerId: string,
    query?: {
      memberId?: string;
      status?: string;
      from?: string;
      to?: string;
    },
    isAdmin = false,
  ) {
    let targetMemberIds: string[] = [];

    if (query?.memberId) {
      await this.verifyCoachingRelationship(trainerId, query.memberId, isAdmin);
      targetMemberIds = [query.memberId];
    } else if (!isAdmin) {
      const relationships = await prisma.coachMemberRelationship.findMany({
        where: {
          trainerId,
          status: "ACTIVE",
          isActive: true,
        },
        select: { memberId: true },
      });
      targetMemberIds = relationships.map((r) => r.memberId);
      if (targetMemberIds.length === 0) {
        return [];
      }
    }

    const where: any = { isActive: true };

    if (targetMemberIds.length > 0) {
      where.memberId = { in: targetMemberIds };
    }

    if (query?.status) {
      where.status = query.status.toUpperCase();
    }

    if (query?.from || query?.to) {
      where.scheduledAt = {};
      if (query.from) where.scheduledAt.gte = new Date(query.from);
      if (query.to) where.scheduledAt.lte = new Date(query.to);
    }

    const list = await prisma.scheduledWorkout.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        member: { select: { id: true, name: true, email: true, avatarUrl: true } },
        trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        session: {
          select: {
            id: true,
            status: true,
            duration: true,
          },
        },
      },
    });

    const now = Date.now();
    return list.map((sw) => {
      const isPast = now - new Date(sw.scheduledAt).getTime() > 2 * 60 * 60 * 1000;
      let effectiveStatus = sw.status;
      if (sw.status === "SCHEDULED" && isPast && (!sw.session || sw.session.status !== "COMPLETED")) {
        effectiveStatus = "MISSED" as any;
      }
      return {
        ...sw,
        status: effectiveStatus,
      };
    });
  }

  /**
   * Get single scheduled workout by ID with permissions
   */
  async getById(id: string, userId: string, role: string = Roles.MEMBER) {
    const scheduled = await prisma.scheduledWorkout.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        member: { select: { id: true, name: true, email: true, avatarUrl: true } },
        trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        assignment: {
          include: {
            trainer: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        session: {
          select: {
            id: true,
            status: true,
            duration: true,
          },
        },
      },
    });

    if (!scheduled) {
      throw new AppError("Scheduled workout not found.", 404);
    }

    if (role === Roles.MEMBER && scheduled.memberId !== userId) {
      throw new AppError("Unauthorized to view this scheduled workout.", 403);
    }

    if (role === Roles.TRAINER && scheduled.trainerId !== userId) {
      // Check if coach has active coaching relationship with this member
      await this.verifyCoachingRelationship(userId, scheduled.memberId, false);
    }

    return scheduled;
  }

  /**
   * Member updates their self-scheduled workout
   */
  async update(id: string, memberId: string, data: UpdateScheduledWorkoutInput) {
    const scheduled = await this.getById(id, memberId, Roles.MEMBER);

    // If scheduled by coach or tied to a coach assignment, member cannot reschedule without coach
    if (scheduled.trainerId && scheduled.trainerId !== memberId) {
      throw new AppError(
        "This workout was scheduled by your coach. Please contact your coach to reschedule.",
        403,
      );
    }

    const updateData: any = {};

    if (data.scheduledAt) {
      const scheduledDate = new Date(data.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        throw new AppError("Invalid scheduled date format.", 400);
      }
      updateData.scheduledAt = scheduledDate;
      updateData.status = "RESCHEDULED";
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes?.trim() || null;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    const updated = await prisma.scheduledWorkout.update({
      where: { id: scheduled.id },
      data: updateData,
      include: {
        workout: true,
        assignment: {
          include: {
            trainer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Coach updates/reschedules an athlete's workout
   */
  async updateCoachScheduled(
    trainerId: string,
    id: string,
    data: UpdateCoachScheduledInput,
    isAdmin = false,
  ) {
    const scheduled = await this.getById(id, trainerId, Roles.TRAINER);

    await this.verifyCoachingRelationship(trainerId, scheduled.memberId, isAdmin);

    const updateData: any = {};
    let isRescheduled = false;
    let newDate = scheduled.scheduledAt;

    if (data.scheduledAt) {
      newDate = new Date(data.scheduledAt);
      if (isNaN(newDate.getTime())) {
        throw new AppError("Invalid scheduled date format.", 400);
      }
      updateData.scheduledAt = newDate;
      updateData.status = "RESCHEDULED";
      isRescheduled = true;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes?.trim() || null;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    const coach = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { name: true },
    });

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.scheduledWorkout.update({
        where: { id: scheduled.id },
        data: updateData,
        include: {
          workout: true,
          member: { select: { id: true, name: true } },
        },
      });

      if (isRescheduled) {
        await tx.notification.create({
          data: {
            userId: scheduled.memberId,
            title: "Workout Schedule Updated",
            message: `Coach ${coach?.name || "Your Coach"} rescheduled your workout "${scheduled.workout?.title || "Workout"}" to ${newDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}.`,
            type: (NOTIFICATION_TYPE as any).WORKOUT_SCHEDULE_UPDATED || "SYSTEM",
            actionUrl: "/calendar",
          },
        });
      }

      return res;
    });

    return updated;
  }

  /**
   * Member cancels self-scheduled workout
   */
  async cancel(id: string, memberId: string) {
    const scheduled = await this.getById(id, memberId, Roles.MEMBER);

    if (scheduled.trainerId && scheduled.trainerId !== memberId) {
      throw new AppError(
        "This workout was scheduled by your coach. You cannot cancel a coach-assigned schedule directly.",
        403,
      );
    }

    const cancelled = await prisma.scheduledWorkout.update({
      where: { id: scheduled.id },
      data: {
        status: "CANCELLED",
      },
    });

    return cancelled;
  }

  /**
   * Coach cancels a scheduled workout for member
   */
  async cancelCoachScheduled(
    trainerId: string,
    id: string,
    reason?: string,
    isAdmin = false,
  ) {
    const scheduled = await this.getById(id, trainerId, Roles.TRAINER);
    await this.verifyCoachingRelationship(trainerId, scheduled.memberId, isAdmin);

    const coach = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { name: true },
    });

    const cancelled = await prisma.$transaction(async (tx) => {
      const res = await tx.scheduledWorkout.update({
        where: { id: scheduled.id },
        data: {
          status: "CANCELLED",
          notes: reason ? `Cancelled by coach: ${reason.trim()}` : scheduled.notes,
        },
      });

      await tx.notification.create({
        data: {
          userId: scheduled.memberId,
          title: "Scheduled Workout Cancelled",
          message: `Coach ${coach?.name || "Your Coach"} cancelled the scheduled workout "${scheduled.workout.title}".`,
          type: (NOTIFICATION_TYPE as any).WORKOUT_SCHEDULE_CANCELLED || "SYSTEM",
          actionUrl: "/calendar",
        },
      });

      return res;
    });

    return cancelled;
  }

  /**
   * Member starts live workout session
   */
  async start(id: string, memberId: string) {
    const scheduled = await this.getById(id, memberId, Roles.MEMBER);

    if (scheduled.status !== "SCHEDULED" && scheduled.status !== "RESCHEDULED") {
      throw new AppError(
        `Cannot start a scheduled workout with status: ${scheduled.status}`,
        400,
      );
    }

    // Start live workout session via existing workout session service
    const session = await workoutSessionService.start(
      memberId,
      scheduled.assignmentId || undefined,
      scheduled.workoutId,
    );

    // Link session to scheduled workout
    await prisma.scheduledWorkout.update({
      where: { id: scheduled.id },
      data: {
        sessionId: session.id,
      },
    });

    return session;
  }

  /**
   * Weekly adherence & upcoming summary for Member Calendar
   */
  async getMemberCalendarSummary(memberId: string, dateStr?: string) {
    const refDate = dateStr ? new Date(dateStr) : new Date();

    // Start & end of the week (Monday - Sunday)
    const currentDay = refDate.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() - distanceToMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    // Upcoming window: now to 7 days ahead
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const [weekWorkouts, upcomingWorkouts] = await Promise.all([
      prisma.scheduledWorkout.findMany({
        where: {
          memberId,
          isActive: true,
          scheduledAt: { gte: monday, lte: sunday },
        },
        include: {
          workout: { select: { id: true, title: true, difficulty: true } },
          session: { select: { id: true, status: true, duration: true } },
        },
      }),
      prisma.scheduledWorkout.findMany({
        where: {
          memberId,
          isActive: true,
          scheduledAt: { gte: now, lte: nextWeek },
          status: { in: ["SCHEDULED", "RESCHEDULED"] },
        },
        take: 5,
        orderBy: { scheduledAt: "asc" },
        include: {
          workout: { select: { id: true, title: true, difficulty: true } },
        },
      }),
    ]);

    // Calculate weekly completion adherence
    let totalScheduledInWeek = 0;
    let completedInWeek = 0;
    let missedInWeek = 0;

    const scheduledDatesSet = new Set<string>();

    for (const sw of weekWorkouts) {
      const dateKey = sw.scheduledAt.toISOString().split("T")[0];
      scheduledDatesSet.add(dateKey);

      if (sw.status === "COMPLETED" || sw.session?.status === "COMPLETED") {
        completedInWeek++;
        totalScheduledInWeek++;
      } else if (sw.status === "SCHEDULED" || sw.status === "RESCHEDULED") {
        totalScheduledInWeek++;
        if (now.getTime() - new Date(sw.scheduledAt).getTime() > 2 * 3600 * 1000) {
          missedInWeek++;
        }
      }
    }

    const adherenceRatePct =
      totalScheduledInWeek > 0
        ? Math.round((completedInWeek / totalScheduledInWeek) * 100)
        : 100;

    // Derived Rest Days for the current week (days with 0 scheduled workouts)
    const restDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayKey = day.toISOString().split("T")[0];
      if (!scheduledDatesSet.has(dayKey)) {
        restDays.push(dayKey);
      }
    }

    return {
      weekRange: {
        monday: monday.toISOString().split("T")[0],
        sunday: sunday.toISOString().split("T")[0],
      },
      weeklyStats: {
        totalScheduled: totalScheduledInWeek,
        completed: completedInWeek,
        missed: missedInWeek,
        adherenceRatePct,
      },
      upcomingWorkouts,
      restDays,
    };
  }
}

export default new ScheduledWorkoutService();
