// src/services/coaching-appointment.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles } from "../constants/roles.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

export interface CreateAppointmentDto {
  memberId: string;
  title: string;
  type?: any;
  startTime: string;
  endTime: string;
  memberNotes?: string;
  coachNotes?: string;
  location?: string;
}

export interface UpdateAppointmentDto {
  title?: string;
  type?: any;
  startTime?: string;
  endTime?: string;
  memberNotes?: string;
  coachNotes?: string;
  location?: string;
  status?: any;
}

export class CoachingAppointmentService {
  /**
   * Verify coach is authorized to schedule with member via active CoachMemberRelationship
   */
  public async verifyCoachingRelationship(
    trainerId: string,
    memberId: string,
    isAdmin = false,
  ) {
    if (isAdmin) return true;

    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId,
        memberId,
        status: "ACTIVE",
        isActive: true,
      },
    });

    if (!relationship) {
      throw new AppError(
        "Unauthorized: You can only schedule appointments with members with whom you have an active coaching relationship.",
        403,
      );
    }

    return true;
  }

  /**
   * Coach creates a coaching appointment for an authorized member
   */
  public async createAppointment(
    trainerId: string,
    data: CreateAppointmentDto,
    isAdmin = false,
  ) {
    await this.verifyCoachingRelationship(trainerId, data.memberId, isAdmin);

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new AppError("Invalid date/time format for appointment.", 400);
    }

    if (endTime.getTime() <= startTime.getTime()) {
      throw new AppError("Appointment end time must be strictly after start time.", 400);
    }

    // 1. Check for overlapping active appointments for this coach
    const coachConflict = await prisma.coachingAppointment.findFirst({
      where: {
        trainerId,
        status: { in: ["SCHEDULED", "RESCHEDULED"] },
        isActive: true,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: { member: { select: { name: true } } },
    });

    if (coachConflict) {
      throw new AppError(
        `Appointment conflict: You already have a scheduled appointment with ${coachConflict.member.name} between ${coachConflict.startTime.toISOString()} and ${coachConflict.endTime.toISOString()}.`,
        409,
      );
    }

    // 2. Check for overlapping active appointments for this member
    const memberConflict = await prisma.coachingAppointment.findFirst({
      where: {
        memberId: data.memberId,
        status: { in: ["SCHEDULED", "RESCHEDULED"] },
        isActive: true,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (memberConflict) {
      throw new AppError(
        "The member already has another scheduled appointment conflicting with this time window.",
        409,
      );
    }

    // 3. Create appointment and notification inside transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const created = await tx.coachingAppointment.create({
        data: {
          trainerId,
          memberId: data.memberId,
          title: data.title.trim(),
          type: data.type || "CHECK_IN",
          status: "SCHEDULED",
          startTime,
          endTime,
          memberNotes: data.memberNotes?.trim() || null,
          coachNotes: data.coachNotes?.trim() || null,
          location: data.location?.trim() || null,
        },
        include: {
          member: { select: { id: true, name: true, email: true } },
          trainer: { select: { id: true, name: true, email: true } },
        },
      });

      // Notify Member
      await tx.notification.create({
        data: {
          userId: data.memberId,
          title: "Coaching Appointment Scheduled",
          message: `Coach ${created.trainer.name} scheduled a "${created.title}" (${created.type}) appointment for ${startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}.`,
          type: (NOTIFICATION_TYPE as any).COACHING_APPOINTMENT_SCHEDULED || "SYSTEM",
          actionUrl: "/calendar",
          metadata: {
            appointmentId: created.id,
            trainerId,
            startTime: startTime.toISOString(),
          },
        },
      });

      return created;
    });

    return appointment;
  }

  /**
   * Coach retrieves appointments across their authorized members
   */
  public async getCoachAppointments(
    trainerId: string,
    query?: {
      memberId?: string;
      status?: string;
      from?: string;
      to?: string;
      date?: string;
    },
    isAdmin = false,
  ) {
    const where: any = { isActive: true };

    if (!isAdmin) {
      where.trainerId = trainerId;
    } else if (trainerId) {
      where.trainerId = trainerId;
    }

    if (query?.memberId) {
      await this.verifyCoachingRelationship(trainerId, query.memberId, isAdmin);
      where.memberId = query.memberId;
    }

    if (query?.status) {
      where.status = query.status.toUpperCase();
    }

    if (query?.date) {
      const targetDate = new Date(query.date);
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.startTime = { gte: startOfDay, lte: endOfDay };
    } else {
      if (query?.from || query?.to) {
        where.startTime = {};
        if (query.from) where.startTime.gte = new Date(query.from);
        if (query.to) where.startTime.lte = new Date(query.to);
      }
    }

    const appointments = await prisma.coachingAppointment.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        member: { select: { id: true, name: true, email: true, phone: true } },
        trainer: { select: { id: true, name: true, email: true } },
      },
    });

    return appointments;
  }

  /**
   * Member retrieves their own appointments (Strict privacy: coachNotes stripped!)
   */
  public async getMemberAppointments(
    memberId: string,
    query?: { status?: string; from?: string; to?: string },
  ) {
    const where: any = {
      memberId,
      isActive: true,
    };

    if (query?.status) {
      where.status = query.status.toUpperCase();
    }

    if (query?.from || query?.to) {
      where.startTime = {};
      if (query.from) where.startTime.gte = new Date(query.from);
      if (query.to) where.startTime.lte = new Date(query.to);
    }

    const appointments = await prisma.coachingAppointment.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            specialties: true,
          },
        },
      },
    });

    // PRIVACY ENFORCEMENT: Strip private coach-only notes
    return appointments.map((appt) => {
      const { coachNotes, ...memberSafe } = appt;
      return memberSafe;
    });
  }

  /**
   * Get appointment by ID (Privacy-aware)
   */
  public async getAppointmentById(
    id: string,
    userId: string,
    role: string,
  ) {
    const appt = await prisma.coachingAppointment.findFirst({
      where: { id, isActive: true },
      include: {
        member: { select: { id: true, name: true, email: true, phone: true } },
        trainer: { select: { id: true, name: true, email: true, specialties: true } },
      },
    });

    if (!appt) {
      throw new AppError("Coaching appointment not found.", 404);
    }

    // Role verification
    if (role === Roles.MEMBER) {
      if (appt.memberId !== userId) {
        throw new AppError("Unauthorized: You can only view your own appointments.", 403);
      }
      // Strip coach notes for member
      const { coachNotes, ...memberSafe } = appt;
      return memberSafe;
    }

    if (role === Roles.TRAINER) {
      if (appt.trainerId !== userId) {
        throw new AppError("Unauthorized: You can only view your own appointments.", 403);
      }
    }

    return appt;
  }

  /**
   * Reschedule or update appointment
   */
  public async updateAppointment(
    id: string,
    userId: string,
    role: string,
    data: UpdateAppointmentDto,
  ) {
    const appt = await prisma.coachingAppointment.findFirst({
      where: { id, isActive: true },
      include: {
        member: { select: { id: true, name: true } },
        trainer: { select: { id: true, name: true } },
      },
    });

    if (!appt) {
      throw new AppError("Appointment not found.", 404);
    }

    if (role === Roles.MEMBER) {
      if (appt.memberId !== userId) {
        throw new AppError("Unauthorized: You can only edit your own appointments.", 403);
      }
      // Members can only update memberNotes
      const updated = await prisma.coachingAppointment.update({
        where: { id },
        data: {
          memberNotes: data.memberNotes?.trim() || appt.memberNotes,
        },
        include: {
          trainer: { select: { id: true, name: true, email: true } },
        },
      });
      const { coachNotes, ...memberSafe } = updated;
      return memberSafe;
    }

    // Coach or Admin
    if (role === Roles.TRAINER && appt.trainerId !== userId) {
      throw new AppError("Unauthorized: You can only update your own appointments.", 403);
    }

    const updatePayload: any = {};
    if (data.title) updatePayload.title = data.title.trim();
    if (data.type) updatePayload.type = data.type;
    if (data.memberNotes !== undefined) updatePayload.memberNotes = data.memberNotes?.trim() || null;
    if (data.coachNotes !== undefined) updatePayload.coachNotes = data.coachNotes?.trim() || null;
    if (data.location !== undefined) updatePayload.location = data.location?.trim() || null;
    if (data.status) updatePayload.status = data.status;

    let isRescheduled = false;
    let newStart = appt.startTime;
    let newEnd = appt.endTime;

    if (data.startTime || data.endTime) {
      newStart = data.startTime ? new Date(data.startTime) : appt.startTime;
      newEnd = data.endTime ? new Date(data.endTime) : appt.endTime;

      if (newEnd.getTime() <= newStart.getTime()) {
        throw new AppError("End time must be strictly after start time.", 400);
      }

      // Check conflict with other appointments
      const conflict = await prisma.coachingAppointment.findFirst({
        where: {
          id: { not: id },
          trainerId: appt.trainerId,
          status: { in: ["SCHEDULED", "RESCHEDULED"] },
          isActive: true,
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      });

      if (conflict) {
        throw new AppError("Conflict: Another appointment is scheduled during this time window.", 409);
      }

      updatePayload.startTime = newStart;
      updatePayload.endTime = newEnd;
      updatePayload.status = "RESCHEDULED";
      isRescheduled = true;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.coachingAppointment.update({
        where: { id },
        data: updatePayload,
        include: {
          member: { select: { id: true, name: true, email: true } },
          trainer: { select: { id: true, name: true, email: true } },
        },
      });

      if (isRescheduled) {
        await tx.notification.create({
          data: {
            userId: appt.memberId,
            title: "Coaching Appointment Rescheduled",
            message: `Coach ${appt.trainer.name} rescheduled your appointment "${record.title}" to ${newStart.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}.`,
            type: (NOTIFICATION_TYPE as any).COACHING_APPOINTMENT_RESCHEDULED || "SYSTEM",
            actionUrl: "/calendar",
          },
        });
      }

      return record;
    });

    return updated;
  }

  /**
   * Mark appointment COMPLETED
   */
  public async completeAppointment(
    id: string,
    trainerId: string,
    data?: { coachNotes?: string; memberNotes?: string },
    isAdmin = false,
  ) {
    const appt = await prisma.coachingAppointment.findFirst({
      where: { id, isActive: true },
    });

    if (!appt) throw new AppError("Appointment not found.", 404);
    if (!isAdmin && appt.trainerId !== trainerId) {
      throw new AppError("Unauthorized: Only the assigned coach can complete this appointment.", 403);
    }

    const updated = await prisma.coachingAppointment.update({
      where: { id },
      data: {
        status: "COMPLETED",
        coachNotes: data?.coachNotes?.trim() || appt.coachNotes,
        memberNotes: data?.memberNotes?.trim() || appt.memberNotes,
      },
      include: {
        member: { select: { id: true, name: true } },
        trainer: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  /**
   * Mark appointment NO_SHOW
   */
  public async markNoShow(
    id: string,
    trainerId: string,
    coachNotes?: string,
    isAdmin = false,
  ) {
    const appt = await prisma.coachingAppointment.findFirst({
      where: { id, isActive: true },
    });

    if (!appt) throw new AppError("Appointment not found.", 404);
    if (!isAdmin && appt.trainerId !== trainerId) {
      throw new AppError("Unauthorized: Only the assigned coach can mark this appointment as no-show.", 403);
    }

    const updated = await prisma.coachingAppointment.update({
      where: { id },
      data: {
        status: "NO_SHOW",
        coachNotes: coachNotes?.trim() || appt.coachNotes,
      },
      include: {
        member: { select: { id: true, name: true } },
        trainer: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  /**
   * Cancel appointment (Can be cancelled by Coach or Member)
   */
  public async cancelAppointment(
    id: string,
    userId: string,
    role: string,
    reason: string,
  ) {
    const appt = await prisma.coachingAppointment.findFirst({
      where: { id, isActive: true },
      include: {
        member: { select: { id: true, name: true } },
        trainer: { select: { id: true, name: true } },
      },
    });

    if (!appt) throw new AppError("Appointment not found.", 404);

    const isMember = appt.memberId === userId;
    const isTrainer = appt.trainerId === userId;

    if (!isMember && !isTrainer && role !== Roles.ADMIN) {
      throw new AppError("Unauthorized: You cannot cancel this appointment.", 403);
    }

    if (appt.status === "COMPLETED") {
      throw new AppError("Cannot cancel an already completed appointment.", 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.coachingAppointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancellationReason: reason.trim(),
          cancelledBy: userId,
        },
      });

      // Notify the other party
      const notifyUserId = isMember ? appt.trainerId : appt.memberId;
      const cancelledByName = isMember ? appt.member.name : `Coach ${appt.trainer.name}`;

      await tx.notification.create({
        data: {
          userId: notifyUserId,
          title: "Appointment Cancelled",
          message: `${cancelledByName} cancelled the appointment "${appt.title}". Reason: ${reason.trim()}`,
          type: (NOTIFICATION_TYPE as any).COACHING_APPOINTMENT_CANCELLED || "SYSTEM",
          actionUrl: isMember ? "/coach/schedule" : "/calendar",
        },
      });

      return record;
    });

    return updated;
  }

  /**
   * Get today's agenda & upcoming summary for coach
   */
  public async getCoachAgendaSummary(trainerId: string, isAdmin = false) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setUTCHours(23, 59, 59, 999);

    const whereBase: any = { isActive: true };
    if (!isAdmin) whereBase.trainerId = trainerId;

    const [todayAppointments, upcomingAppointments, recentCompleted] =
      await Promise.all([
        prisma.coachingAppointment.findMany({
          where: {
            ...whereBase,
            startTime: { gte: startOfToday, lte: endOfToday },
          },
          orderBy: { startTime: "asc" },
          include: {
            member: { select: { id: true, name: true, email: true, phone: true } },
          },
        }),
        prisma.coachingAppointment.findMany({
          where: {
            ...whereBase,
            startTime: { gt: endOfToday },
            status: { in: ["SCHEDULED", "RESCHEDULED"] },
          },
          take: 5,
          orderBy: { startTime: "asc" },
          include: {
            member: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.coachingAppointment.count({
          where: {
            ...whereBase,
            status: "COMPLETED",
          },
        }),
      ]);

    return {
      today: todayAppointments,
      upcoming: upcomingAppointments,
      totalCompleted: recentCompleted,
      todayCount: todayAppointments.length,
    };
  }
}

export const coachingAppointmentService = new CoachingAppointmentService();
export default coachingAppointmentService;
