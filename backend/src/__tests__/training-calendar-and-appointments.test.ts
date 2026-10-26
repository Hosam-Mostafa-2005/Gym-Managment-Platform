// src/__tests__/training-calendar-and-appointments.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import {
  createAppointmentSchema,
  cancelAppointmentSchema,
} from "../validators/coaching-appointment.validator.js";
import coachingAppointmentService from "../services/coaching-appointment.service.js";
import scheduledWorkoutService from "../services/scheduled-workout.service.js";
import notificationService from "../services/notification.service.js";
import workoutSessionService from "../services/workout-session.service.js";

describe("STREN — Training Calendar & Coaching Scheduling Test Suite", () => {
  const coachId = "coach-uuid-100";
  const otherCoachId = "coach-uuid-999";
  const memberId = "member-uuid-200";

  const coachUser = {
    id: coachId,
    name: "Coach Alexander",
    email: "alexander@stren.app",
    role: Roles.TRAINER,
    isActive: true,
  };

  const memberUser = {
    id: memberId,
    name: "John Athlete",
    email: "john@athlete.stren",
    role: Roles.MEMBER,
    isActive: true,
  };

  // ==========================================================================
  // SECTION 1: SCHEDULING VALIDATORS
  // ==========================================================================
  describe("1. Coaching Appointment Schema Validation", () => {
    it("A. Accepts valid appointment payload", () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 3600000).toISOString();
      const endTime = new Date(now.getTime() + 7200000).toISOString();

      const result = createAppointmentSchema.safeParse({
        body: {
          memberId: "some-member-id",
          title: "Quarterly Form & Progress Check-in",
          type: "FORM_ANALYSIS",
          startTime,
          endTime,
          memberNotes: "Let's review barbell squat depth",
          coachNotes: "Focus on hip mobility",
          location: "Strength Room B",
        },
      });

      assert.equal(result.success, true);
    });

    it("B. Rejects appointment when endTime is equal to or before startTime", () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 3600000).toISOString();
      const endTime = startTime;

      const result = createAppointmentSchema.safeParse({
        body: {
          memberId: "some-member-id",
          title: "Invalid Timespan Session",
          type: "CHECK_IN",
          startTime,
          endTime,
        },
      });

      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some((i) =>
            i.message.includes("strictly after start time"),
          ),
        );
      }
    });

    it("C. Rejects appointment duration under 10 minutes", () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 3600000);
      const endTime = new Date(startTime.getTime() + 5 * 60 * 1000); // 5 minutes

      const result = createAppointmentSchema.safeParse({
        body: {
          memberId: "some-member-id",
          title: "Too Short Session",
          type: "CHECK_IN",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some((i) =>
            i.message.includes("at least 10 minutes"),
          ),
        );
      }
    });

    it("D. Rejects cancellation without a reason", () => {
      const result = cancelAppointmentSchema.safeParse({
        body: {
          reason: " ",
        },
      });
      assert.equal(result.success, false);
    });
  });

  // ==========================================================================
  // SECTION 2: COACHING APPOINTMENTS SERVICE & PRIVACY BOUNDARY
  // ==========================================================================
  describe("2. Coaching Appointment Lifecycle & Privacy Boundary", () => {
    it("A. Rejects appointment creation if no active coaching relationship exists", async () => {
      const origRelFind = prisma.coachMemberRelationship.findFirst;
      (prisma.coachMemberRelationship as any).findFirst = async () => null;

      try {
        await assert.rejects(
          async () => {
            await coachingAppointmentService.createAppointment(
              otherCoachId,
              {
                memberId,
                title: "Unauthorized Session",
                type: "CONSULTATION",
                startTime: new Date(Date.now() + 3600000).toISOString(),
                endTime: new Date(Date.now() + 7200000).toISOString(),
              },
              false,
            );
          },
          (err: any) => {
            assert.equal(err.statusCode, 403);
            assert.ok(err.message.includes("active coaching relationship"));
            return true;
          },
        );
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFind;
      }
    });

    it("B. Creates appointment, prevents overlaps, and creates member notification", async () => {
      const origRelFind = prisma.coachMemberRelationship.findFirst;
      const origApptFind = prisma.coachingAppointment.findFirst;
      const origUserFind = prisma.user.findUnique;
      const origTx = prisma.$transaction;
      const origNotifCreate = notificationService.create;

      const now = Date.now();
      const startTime = new Date(now + 3600000).toISOString();
      const endTime = new Date(now + 7200000).toISOString();

      let createdNotification: any = null;

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-1",
        trainerId: coachId,
        memberId,
        status: "ACTIVE",
      });

      (prisma.user as any).findUnique = async ({ where }: any) => {
        if (where.id === coachId) return coachUser;
        if (where.id === memberId) return memberUser;
        return null;
      };

      // No overlapping appointment
      (prisma.coachingAppointment as any).findFirst = async () => null;

      (prisma as any).$transaction = async (callback: any) => {
        return callback({
          coachingAppointment: {
            create: async ({ data }: any) => ({
              id: "appt-123",
              ...data,
              trainer: coachUser,
              member: memberUser,
            }),
          },
          notification: {
            create: async ({ data }: any) => {
              createdNotification = data;
              return data;
            },
          },
        });
      };

      try {
        const appointment = await coachingAppointmentService.createAppointment(
          coachId,
          {
            memberId,
            title: "Technique & Form Check",
            type: "FORM_ANALYSIS",
            startTime,
            endTime,
            coachNotes: "Secret coach note: Member needs glute activation",
            location: "Studio 1",
          },
          false,
        );

        assert.equal(appointment.id, "appt-123");
        assert.equal(appointment.status, "SCHEDULED");
        assert.ok(createdNotification);
        assert.equal(createdNotification.userId, memberId);
        assert.equal(
          createdNotification.type,
          NOTIFICATION_TYPE.COACHING_APPOINTMENT_SCHEDULED,
        );
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFind;
        prisma.coachingAppointment.findFirst = origApptFind;
        prisma.user.findUnique = origUserFind;
        prisma.$transaction = origTx;
        notificationService.create = origNotifCreate;
      }
    });

    it("C. Rejects overlapping appointments for coach with 409 Conflict", async () => {
      const origRelFind = prisma.coachMemberRelationship.findFirst;
      const origApptFind = prisma.coachingAppointment.findFirst;

      const now = Date.now();
      const startTime = new Date(now + 3600000).toISOString();
      const endTime = new Date(now + 7200000).toISOString();

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-1",
        trainerId: coachId,
        memberId,
        status: "ACTIVE",
      });

      // Returns an existing overlapping appointment for coach
      (prisma.coachingAppointment as any).findFirst = async ({ where }: any) => {
        if (where.trainerId === coachId) {
          return {
            id: "existing-appt",
            trainerId: coachId,
            startTime: new Date(now + 4000000),
            endTime: new Date(now + 6000000),
            member: { name: "Other Athlete" },
          };
        }
        return null;
      };

      try {
        await assert.rejects(
          async () => {
            await coachingAppointmentService.createAppointment(
              coachId,
              {
                memberId,
                title: "Overlapping Consultation",
                type: "CONSULTATION",
                startTime,
                endTime,
              },
              false,
            );
          },
          (err: any) => {
            assert.equal(err.statusCode, 409);
            assert.ok(err.message.includes("already have a scheduled appointment"));
            return true;
          },
        );
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFind;
        prisma.coachingAppointment.findFirst = origApptFind;
      }
    });

    it("D. Strictly strips private coachNotes when member retrieves appointments", async () => {
      const origFindMany = prisma.coachingAppointment.findMany;
      const origFindFirst = prisma.coachingAppointment.findFirst;

      const mockAppt = {
        id: "appt-privacy-1",
        trainerId: coachId,
        memberId,
        title: "Movement Screen",
        type: "ASSESSMENT",
        status: "SCHEDULED",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        memberNotes: "I have slight lower back tightness",
        coachNotes: "CONFIDENTIAL: Possible disc issue; do not permit heavy deadlifts",
        location: "Gym Floor",
        trainer: { id: coachId, name: "Coach Alexander", email: "alex@stren.app" },
        member: { id: memberId, name: "John Athlete", email: "john@stren.app" },
      };

      (prisma.coachingAppointment as any).findMany = async () => [
        { ...mockAppt },
      ];
      (prisma.coachingAppointment as any).findFirst = async () => ({
        ...mockAppt,
      });

      try {
        // 1. Member queries list
        const memberAppointments =
          await coachingAppointmentService.getMemberAppointments(memberId);
        assert.equal(memberAppointments.length, 1);
        assert.equal((memberAppointments[0] as any).coachNotes, undefined);
        assert.equal(
          memberAppointments[0].memberNotes,
          "I have slight lower back tightness",
        );

        // 2. Member queries single item
        const memberSingle =
          await coachingAppointmentService.getAppointmentById(
            "appt-privacy-1",
            memberId,
            Roles.MEMBER,
          );
        assert.equal((memberSingle as any).coachNotes, undefined);
        assert.equal(
          memberSingle.memberNotes,
          "I have slight lower back tightness",
        );

        // 3. Coach queries single item -> coachNotes MUST be present
        const coachSingle =
          await coachingAppointmentService.getAppointmentById(
            "appt-privacy-1",
            coachId,
            Roles.TRAINER,
          );
        assert.equal(
          (coachSingle as any).coachNotes,
          "CONFIDENTIAL: Possible disc issue; do not permit heavy deadlifts",
        );
      } finally {
        prisma.coachingAppointment.findMany = origFindMany;
        prisma.coachingAppointment.findFirst = origFindFirst;
      }
    });

    it("E. Coach completes appointment with notes and sets status to COMPLETED", async () => {
      const origFindFirst = prisma.coachingAppointment.findFirst;
      const origUpdate = prisma.coachingAppointment.update;
      const origRelFind = prisma.coachMemberRelationship.findFirst;

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-1",
        status: "ACTIVE",
      });

      (prisma.coachingAppointment as any).findFirst = async () => ({
        id: "appt-to-complete",
        trainerId: coachId,
        memberId,
        status: "SCHEDULED",
      });

      (prisma.coachingAppointment as any).update = async ({ data }: any) => ({
        id: "appt-to-complete",
        trainerId: coachId,
        memberId,
        status: data.status,
        coachNotes: data.coachNotes,
      });

      try {
        const completed =
          await coachingAppointmentService.completeAppointment(
            "appt-to-complete",
            coachId,
            { coachNotes: "Completed full squat assessment. Form approved." },
            false,
          );

        assert.equal(completed.status, "COMPLETED");
        assert.equal(
          completed.coachNotes,
          "Completed full squat assessment. Form approved.",
        );
      } finally {
        prisma.coachingAppointment.findFirst = origFindFirst;
        prisma.coachingAppointment.update = origUpdate;
        prisma.coachMemberRelationship.findFirst = origRelFind;
      }
    });

    it("F. Cancels appointment and notifies the other party with cancellation reason", async () => {
      const origFindFirst = prisma.coachingAppointment.findFirst;
      const origTx = prisma.$transaction;
      const origUserFind = prisma.user.findUnique;

      let notificationSentTo: any = null;
      let notificationMessage: any = null;

      (prisma.user as any).findUnique = async ({ where }: any) => {
        if (where.id === memberId) return memberUser;
        if (where.id === coachId) return coachUser;
        return null;
      };

      (prisma.coachingAppointment as any).findFirst = async () => ({
        id: "appt-cancel-test",
        trainerId: coachId,
        memberId,
        title: "Nutrition Sync",
        status: "SCHEDULED",
        startTime: new Date(Date.now() + 86400000),
        member: memberUser,
        trainer: coachUser,
      });

      (prisma as any).$transaction = async (callback: any) => {
        return callback({
          coachingAppointment: {
            update: async ({ data }: any) => ({
              id: "appt-cancel-test",
              status: data.status,
            }),
          },
          notification: {
            create: async ({ data }: any) => {
              notificationSentTo = data.userId;
              notificationMessage = data.message;
              return data;
            },
          },
        });
      };

      try {
        // Member cancels appointment -> Coach must receive notification
        const cancelled = await coachingAppointmentService.cancelAppointment(
          "appt-cancel-test",
          memberId,
          Roles.MEMBER,
          "Urgent work conflict",
        );

        assert.equal(cancelled.status, "CANCELLED");
        assert.equal(notificationSentTo, coachId);
        assert.ok(
          typeof notificationMessage === "string" &&
            notificationMessage.includes("Urgent work conflict"),
        );
      } finally {
        prisma.coachingAppointment.findFirst = origFindFirst;
        prisma.$transaction = origTx;
        prisma.user.findUnique = origUserFind;
      }
    });
  });

  // ==========================================================================
  // SECTION 3: TRAINING CALENDAR & SCHEDULED WORKOUTS
  // ==========================================================================
  describe("3. Scheduled Workouts & Calendar Summary", () => {
    it("A. Correctly calculates member calendar adherence and identifies MISSED workouts", async () => {
      const origFindMany = prisma.scheduledWorkout.findMany;

      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      const yesterday = new Date(Date.now() - 86400000);
      const tomorrow = new Date(Date.now() + 86400000);

      // 1 completed, 1 missed (past with status SCHEDULED), 1 upcoming
      const mockWorkouts = [
        {
          id: "sched-1",
          memberId,
          scheduledAt: twoDaysAgo,
          status: "COMPLETED",
          workout: { id: "w1", title: "Upper Body Hypertrophy", exercises: [] },
          session: { id: "sess-1", status: "COMPLETED", duration: 3200 },
          isActive: true,
        },
        {
          id: "sched-2",
          memberId,
          scheduledAt: yesterday,
          status: "SCHEDULED", // Past without session -> dynamically classified as MISSED
          workout: { id: "w2", title: "Leg Day", exercises: [] },
          session: null,
          isActive: true,
        },
        {
          id: "sched-3",
          memberId,
          scheduledAt: tomorrow,
          status: "SCHEDULED", // Future -> still SCHEDULED
          workout: { id: "w3", title: "Core & Mobility", exercises: [] },
          session: null,
          isActive: true,
        },
      ];

      (prisma.scheduledWorkout as any).findMany = async () => mockWorkouts;

      try {
        const workouts = await scheduledWorkoutService.getAll(memberId);
        const missedWorkout = workouts.find((w: any) => w.id === "sched-2");
        const futureWorkout = workouts.find((w: any) => w.id === "sched-3");

        assert.equal(missedWorkout?.status, "MISSED");
        assert.equal(futureWorkout?.status, "SCHEDULED");

        const summary =
          await scheduledWorkoutService.getMemberCalendarSummary(memberId);
        assert.ok(Array.isArray(summary.upcomingWorkouts));
        assert.ok(Array.isArray(summary.restDays));
        assert.ok(summary.weeklyStats.adherenceRatePct >= 0);
      } finally {
        prisma.scheduledWorkout.findMany = origFindMany;
      }
    });

    it("B. Coach schedules workout for active member and triggers notification", async () => {
      const origRelFind = prisma.coachMemberRelationship.findFirst;
      const origWorkoutFindUnique = prisma.workout.findUnique;
      const origUserFind = prisma.user.findUnique;
      const origTx = prisma.$transaction;

      let sentNotification: any = null;

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-1",
        trainerId: coachId,
        memberId,
        status: "ACTIVE",
      });

      (prisma.workout as any).findUnique = async () => ({
        id: "workout-bench-1",
        title: "Chest & Triceps Focus",
        isActive: true,
        exercises: [{ id: "we-1" }],
      });

      (prisma.user as any).findUnique = async () => coachUser;

      (prisma as any).$transaction = async (callback: any) => {
        return callback({
          scheduledWorkout: {
            create: async ({ data }: any) => ({
              id: "sched-coach-created",
              ...data,
              workout: { title: "Chest & Triceps Focus", exercises: [] },
              trainer: coachUser,
            }),
          },
          notification: {
            create: async ({ data }: any) => {
              sentNotification = data;
              return data;
            },
          },
        });
      };

      try {
        const created = await scheduledWorkoutService.createCoachScheduled(
          coachId,
          {
            memberId,
            workoutId: "workout-bench-1",
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            notes: "Focus on slow eccentric tempo on bench press.",
          },
          false,
        );

        assert.equal(created.id, "sched-coach-created");
        assert.equal(created.trainerId, coachId);
        assert.ok(sentNotification);
        assert.equal(sentNotification.userId, memberId);
        assert.equal(
          sentNotification.type,
          NOTIFICATION_TYPE.WORKOUT_SCHEDULED,
        );
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFind;
        prisma.workout.findUnique = origWorkoutFindUnique;
        prisma.user.findUnique = origUserFind;
        prisma.$transaction = origTx;
      }
    });

    it("C. Prevents member from modifying or cancelling a coach-scheduled workout", async () => {
      const origFind = prisma.scheduledWorkout.findFirst;

      (prisma.scheduledWorkout as any).findFirst = async () => ({
        id: "coach-managed-workout",
        memberId,
        trainerId: coachId, // Scheduled by coach!
        isActive: true,
      });

      try {
        // Attempt update by member
        await assert.rejects(
          async () => {
            await scheduledWorkoutService.update(
              "coach-managed-workout",
              memberId,
              { scheduledAt: new Date().toISOString() },
            );
          },
          (err: any) => {
            assert.equal(err.statusCode, 403);
            assert.ok(err.message.includes("scheduled by your coach"));
            return true;
          },
        );

        // Attempt cancel by member
        await assert.rejects(
          async () => {
            await scheduledWorkoutService.cancel(
              "coach-managed-workout",
              memberId,
            );
          },
          (err: any) => {
            assert.equal(err.statusCode, 403);
            assert.ok(err.message.includes("scheduled by your coach"));
            return true;
          },
        );
      } finally {
        prisma.scheduledWorkout.findFirst = origFind;
      }
    });

    it("D. Completing a workout session automatically transitions linked ScheduledWorkout to COMPLETED", async () => {
      const origSessionFind = prisma.workoutSession.findFirst;
      const origSessionUpdate = prisma.workoutSession.update;
      const origSchedUpdateMany = prisma.scheduledWorkout.updateMany;
      const origNotifCreate = notificationService.create;

      let scheduledWorkoutCompleted = false;

      (prisma.workoutSession as any).findFirst = async () => ({
        id: "session-active-1",
        memberId,
        status: "IN_PROGRESS",
        startedAt: new Date(Date.now() - 3600000),
        totalRestTime: 300,
        notes: "Great workout session",
        workout: { id: "w-1", title: "Leg Day" },
        assignmentId: null,
      });

      (prisma.workoutSession as any).update = async ({ data }: any) => ({
        id: "session-active-1",
        memberId,
        status: "COMPLETED",
        duration: data.duration,
        workout: { id: "w-1", title: "Leg Day" },
      });

      (prisma.scheduledWorkout as any).updateMany = async ({ where, data }: any) => {
        if (where.sessionId === "session-active-1" && data.status === "COMPLETED") {
          scheduledWorkoutCompleted = true;
        }
        return { count: 1 };
      };

      (notificationService as any).create = async () => ({ id: "notif-1" });

      try {
        await workoutSessionService.finish("session-active-1", memberId, {
          notes: "Finished strong!",
        });
        assert.equal(
          scheduledWorkoutCompleted,
          true,
          "Linked scheduled workout must transition to COMPLETED when session finishes",
        );
      } finally {
        prisma.workoutSession.findFirst = origSessionFind;
        prisma.workoutSession.update = origSessionUpdate;
        prisma.scheduledWorkout.updateMany = origSchedUpdateMany;
        notificationService.create = origNotifCreate;
      }
    });
  });
});
