import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import coachProfileService from "../services/coach-profile.service.js";
import workoutSessionService from "../services/workout-session.service.js";
import assignmentService from "../services/assignment.service.js";
import userService from "../services/user.service.js";
import { createAssignmentSchema } from "../validators/assignment.validator.js";

describe("STREN — Coach Access, Workout Sessions & Quick Assignment Verification", () => {
  const coach1Id = "coach-1111-uuid";
  const coach2Id = "coach-2222-uuid";
  const memberId = "member-3333-uuid";
  const otherMemberId = "member-4444-uuid";

  describe("1. Coach Profile & Telemetry Resolution", () => {
    it("successfully retrieves coach profile and telemetry without 500 error", async () => {
      const origUserFindFirst = prisma.user.findFirst;
      const origWorkoutCount = prisma.workout.count;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origAssignmentCount = prisma.assignment.count;
      const origWorkoutSessionCount = prisma.workoutSession.count;
      const origWorkoutSessionFindMany = prisma.workoutSession.findMany;
      const origScheduledWorkoutCount = prisma.scheduledWorkout.count;
      const origScheduledWorkoutFindMany = prisma.scheduledWorkout.findMany;

      (prisma.user as any).findFirst = async () => ({
        id: coach1Id,
        name: "Coach Marcus",
        email: "coach.marcus@stren.app",
        role: Roles.TRAINER,
        phone: "+1-555-0199",
        avatar: null,
        bio: "Elite strength & conditioning coach.",
        specialties: ["Powerlifting", "Hypertrophy"],
        certifications: ["CSCS", "NASM-CPT"],
        yearsOfExperience: 8,
        createdAt: new Date("2024-01-01"),
      });

      (prisma.workout as any).count = async () => 14;
      (prisma.assignment as any).findMany = async () => [];
      (prisma.assignment as any).count = async () => 8;
      (prisma.workoutSession as any).count = async () => 42;
      (prisma.workoutSession as any).findMany = async () => [];
      (prisma.scheduledWorkout as any).count = async () => 5;
      (prisma.scheduledWorkout as any).findMany = async () => [];

      try {
        const result = await coachProfileService.getProfile(coach1Id, Roles.TRAINER);

        assert.ok(result);
        assert.equal(result.profile.id, coach1Id);
        assert.equal(result.profile.name, "Coach Marcus");
        assert.equal(result.profile.email, "coach.marcus@stren.app");
        assert.equal(result.profile.yearsOfExperience, 8);
        assert.deepEqual(result.profile.specialties, ["Powerlifting", "Hypertrophy"]);
        assert.ok(result.overview);
        assert.ok(result.memberStats);
        assert.ok(result.workoutStats);
        assert.equal(result.workoutStats.totalCreated, 14);
        assert.ok(result.charts);
        assert.ok(result.recentActivity);
        assert.ok(result.achievements);
        assert.ok(result.upcomingTasks);
        assert.ok(result.ai);
      } finally {
        prisma.user.findFirst = origUserFindFirst;
        prisma.workout.count = origWorkoutCount;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.assignment.count = origAssignmentCount;
        prisma.workoutSession.count = origWorkoutSessionCount;
        prisma.workoutSession.findMany = origWorkoutSessionFindMany;
        prisma.scheduledWorkout.count = origScheduledWorkoutCount;
        prisma.scheduledWorkout.findMany = origScheduledWorkoutFindMany;
      }
    });

    it("handles coach with missing bio/specialties gracefully without crashing", async () => {
      const origUserFindFirst = prisma.user.findFirst;
      const origWorkoutCount = prisma.workout.count;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origAssignmentCount = prisma.assignment.count;
      const origWorkoutSessionCount = prisma.workoutSession.count;
      const origWorkoutSessionFindMany = prisma.workoutSession.findMany;
      const origScheduledWorkoutCount = prisma.scheduledWorkout.count;
      const origScheduledWorkoutFindMany = prisma.scheduledWorkout.findMany;

      (prisma.user as any).findFirst = async () => ({
        id: coach2Id,
        name: "Coach Barebones",
        email: "coach.bare@stren.app",
        role: Roles.TRAINER,
        phone: null,
        avatar: null,
        bio: null,
        specialties: null,
        certifications: null,
        yearsOfExperience: null,
        createdAt: new Date("2024-02-01"),
      });

      (prisma.workout as any).count = async () => 0;
      (prisma.assignment as any).findMany = async () => [];
      (prisma.assignment as any).count = async () => 0;
      (prisma.workoutSession as any).count = async () => 0;
      (prisma.workoutSession as any).findMany = async () => [];
      (prisma.scheduledWorkout as any).count = async () => 0;
      (prisma.scheduledWorkout as any).findMany = async () => [];

      try {
        const result = await coachProfileService.getProfile(coach2Id, Roles.TRAINER);

        assert.ok(result);
        assert.equal(result.profile.id, coach2Id);
        assert.equal(result.profile.bio, null);
        assert.deepEqual(result.profile.specialties, []);
        assert.deepEqual(result.profile.certifications, []);
        assert.equal(result.profile.yearsOfExperience, 0);
      } finally {
        prisma.user.findFirst = origUserFindFirst;
        prisma.workout.count = origWorkoutCount;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.assignment.count = origAssignmentCount;
        prisma.workoutSession.count = origWorkoutSessionCount;
        prisma.workoutSession.findMany = origWorkoutSessionFindMany;
        prisma.scheduledWorkout.count = origScheduledWorkoutCount;
        prisma.scheduledWorkout.findMany = origScheduledWorkoutFindMany;
      }
    });
  });

  describe("2. Workout Access & Session Authorization", () => {
    it("allows a coach to start a session for their own workout", async () => {
      const origWorkoutFindUnique = prisma.workout.findUnique;
      const origSessionFindFirst = prisma.workoutSession.findFirst;
      const origTransaction = prisma.$transaction;

      (prisma.workout as any).findUnique = async () => ({
        id: "workout-owned-by-coach",
        title: "Coach Strength Test",
        createdBy: coach1Id,
        isTemplate: false,
        isActive: true,
        exercises: [],
      });

      // No active session
      (prisma.workoutSession as any).findFirst = async () => null;

      (prisma.$transaction as any) = async (cb: any) => {
        return cb({
          workoutSession: {
            create: async ({ data }: any) => ({
              id: "session-coach-1",
              ...data,
              status: "IN_PROGRESS",
              startedAt: new Date(),
              workout: {
                id: "workout-owned-by-coach",
                title: "Coach Strength Test",
                exercises: [],
              },
            }),
          },
          workoutExerciseLog: { create: async () => ({ id: "log-1" }) },
          workoutSetLog: { create: async () => ({ id: "set-1" }) },
        });
      };

      try {
        const session = await workoutSessionService.start(
          coach1Id,
          undefined,
          "workout-owned-by-coach",
        );

        assert.ok(session);
        assert.equal(session.workoutId, "workout-owned-by-coach");
        assert.equal(session.status, "IN_PROGRESS");
      } finally {
        prisma.workout.findUnique = origWorkoutFindUnique;
        prisma.workoutSession.findFirst = origSessionFindFirst;
        prisma.$transaction = origTransaction;
      }
    });

    it("allows a member to start a workout session for a coach's workout if member is assigned to it", async () => {
      const origWorkoutFindUnique = prisma.workout.findUnique;
      const origSessionFindFirst = prisma.workoutSession.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origNotificationCreate = prisma.notification.create;
      const origTransaction = prisma.$transaction;

      (prisma.workout as any).findUnique = async () => ({
        id: "workout-coach-assigned",
        title: "Assigned Hypertrophy",
        createdBy: coach1Id, // Coach created this workout
        isTemplate: false,
        isActive: true,
        exercises: [],
      });

      (prisma.workoutSession as any).findFirst = async () => null;

      // Active assignment linking member to this workout
      (prisma.assignment as any).findFirst = async () => ({
        id: "assign-uuid-1",
        memberId: memberId,
        workoutId: "workout-coach-assigned",
        trainerId: coach1Id,
        status: "ACTIVE",
        isActive: true,
        member: { id: memberId, name: "Member A" },
        workout: { id: "workout-coach-assigned", title: "Assigned Hypertrophy" },
      });

      (prisma.notification as any).create = async () => ({ id: "notif-uuid" });

      (prisma.$transaction as any) = async (cb: any) => {
        return cb({
          workoutSession: {
            create: async ({ data }: any) => ({
              id: "session-assigned-member",
              ...data,
              assignmentId: "assign-uuid-1",
              assignment: { id: "assign-uuid-1" },
              status: "IN_PROGRESS",
              startedAt: new Date(),
              workout: {
                id: "workout-coach-assigned",
                title: "Assigned Hypertrophy",
                exercises: [],
              },
            }),
          },
          workoutExerciseLog: { create: async () => ({ id: "log-1" }) },
          workoutSetLog: { create: async () => ({ id: "set-1" }) },
        });
      };

      try {
        const session = await workoutSessionService.start(
          memberId,
          undefined,
          "workout-coach-assigned",
        );

        assert.ok(session);
        assert.equal(session.workoutId, "workout-coach-assigned");
        assert.equal(session.assignment?.id, "assign-uuid-1");
      } finally {
        prisma.workout.findUnique = origWorkoutFindUnique;
        prisma.workoutSession.findFirst = origSessionFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.notification.create = origNotificationCreate;
        prisma.$transaction = origTransaction;
      }
    });

    it("rejects an unassigned member from starting a private workout belonging to a coach", async () => {
      const origWorkoutFindUnique = prisma.workout.findUnique;
      const origSessionFindFirst = prisma.workoutSession.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;

      (prisma.workout as any).findUnique = async () => ({
        id: "private-coach-workout",
        title: "Private Protocol",
        createdBy: coach1Id,
        isTemplate: false,
        isActive: true,
        exercises: [],
      });

      (prisma.workoutSession as any).findFirst = async () => null;
      (prisma.assignment as any).findFirst = async () => null; // Not assigned

      try {
        await assert.rejects(
          async () => {
            await workoutSessionService.start(
              otherMemberId,
              undefined,
              "private-coach-workout",
            );
          },
          (err: any) => err.statusCode === 403,
        );
      } finally {
        prisma.workout.findUnique = origWorkoutFindUnique;
        prisma.workoutSession.findFirst = origSessionFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
      }
    });
  });

  describe("3. Quick Assignment Authorization & Coach Identity Locking", () => {
    it("validates assignment payload with optional trainer field", () => {
      const parsed = createAssignmentSchema.safeParse({
        body: {
          member: "507f1f77bcf86cd799439011",
          workout: "507f1f77bcf86cd799439012",
          startDate: "2026-11-01",
          endDate: "2026-12-01",
        },
      });

      assert.equal(parsed.success, true);
    });

    it("allows coach to assign their own workout to a member, enforcing coach's ID", async () => {
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origUserFindFirst = prisma.user.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origCoachRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origAssignmentCreate = prisma.assignment.create;
      const origNotificationCreate = prisma.notification.create;

      (prisma.workout as any).findFirst = async () => ({
        id: "coach1-custom-routine",
        title: "Coach 1 Custom",
        createdBy: coach1Id,
        isTemplate: false,
        isActive: true,
      });

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where.id === memberId) {
          return { id: memberId, role: Roles.MEMBER, isActive: true };
        }
        return { id: coach1Id, role: Roles.TRAINER, isActive: true };
      };

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-active-uuid",
        trainerId: coach1Id,
        memberId: memberId,
        status: "ACTIVE",
        isActive: true,
      });

      (prisma.assignment as any).findFirst = async () => null; // No duplicate active assignment
      (prisma.notification as any).create = async () => ({ id: "notif-uuid" });

      let createdAssignmentData: any = null;
      (prisma.assignment as any).create = async ({ data }: any) => {
        createdAssignmentData = data;
        return {
          id: "new-assignment-uuid",
          ...data,
          status: "ACTIVE",
          isActive: true,
          trainer: { id: data.trainerId, name: "Coach 1" },
          member: { id: data.memberId, name: "Member A" },
          workout: { id: data.workoutId, title: "Coach 1 Custom" },
        };
      };

      try {
        const result = await assignmentService.create(
          {
            member: memberId,
            workout: "coach1-custom-routine",
            startDate: new Date("2026-11-01"),
            endDate: new Date("2026-12-01"),
          },
          coach1Id,
          Roles.TRAINER,
        );

        assert.ok(result);
        assert.equal(createdAssignmentData.trainerId, coach1Id);
        assert.equal(createdAssignmentData.memberId, memberId);
        assert.equal(createdAssignmentData.workoutId, "coach1-custom-routine");
      } finally {
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.user.findFirst = origUserFindFirst;
        prisma.coachMemberRelationship.findFirst = origCoachRelFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.assignment.create = origAssignmentCreate;
        prisma.notification.create = origNotificationCreate;
      }
    });

    it("allows coach to assign a template workout to a member", async () => {
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origUserFindFirst = prisma.user.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origCoachRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origAssignmentCreate = prisma.assignment.create;
      const origNotificationCreate = prisma.notification.create;

      (prisma.workout as any).findFirst = async () => ({
        id: "template-routine",
        title: "Standard Template 5x5",
        createdBy: "system-admin-uuid",
        isTemplate: true,
        isActive: true,
      });

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where.id === memberId) {
          return { id: memberId, role: Roles.MEMBER, isActive: true };
        }
        return { id: coach1Id, role: Roles.TRAINER, isActive: true };
      };

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-active-uuid",
        trainerId: coach1Id,
        memberId: memberId,
        status: "ACTIVE",
        isActive: true,
      });

      (prisma.assignment as any).findFirst = async () => null;
      (prisma.notification as any).create = async () => ({ id: "notif-uuid" });

      let createdAssignmentData: any = null;
      (prisma.assignment as any).create = async ({ data }: any) => {
        createdAssignmentData = data;
        return {
          id: "new-assignment-template",
          ...data,
          status: "ACTIVE",
          isActive: true,
          trainer: { id: data.trainerId, name: "Coach 1" },
          member: { id: data.memberId, name: "Member A" },
          workout: { id: data.workoutId, title: "Standard Template 5x5" },
        };
      };

      try {
        const result = await assignmentService.create(
          {
            member: memberId,
            workout: "template-routine",
            startDate: new Date("2026-11-01"),
            endDate: new Date("2026-12-01"),
          },
          coach1Id,
          Roles.TRAINER,
        );

        assert.ok(result);
        assert.equal(createdAssignmentData.trainerId, coach1Id);
        assert.equal(createdAssignmentData.workoutId, "template-routine");
      } finally {
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.user.findFirst = origUserFindFirst;
        prisma.coachMemberRelationship.findFirst = origCoachRelFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.assignment.create = origAssignmentCreate;
        prisma.notification.create = origNotificationCreate;
      }
    });

    it("rejects coach from assigning workout to member without active coaching relationship", async () => {
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origUserFindFirst = prisma.user.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origCoachRelFindFirst = prisma.coachMemberRelationship.findFirst;

      (prisma.workout as any).findFirst = async () => ({
        id: "coach1-custom-routine",
        title: "Coach 1 Custom",
        createdBy: coach1Id,
        isTemplate: false,
        isActive: true,
      });

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where.id === memberId) {
          return { id: memberId, role: Roles.MEMBER, isActive: true };
        }
        return { id: coach1Id, role: Roles.TRAINER, isActive: true };
      };

      (prisma.coachMemberRelationship as any).findFirst = async () => null; // No coaching relationship!
      (prisma.assignment as any).findFirst = async () => null; // No active assignment!

      try {
        await assert.rejects(
          async () => {
            await assignmentService.create(
              {
                member: memberId,
                workout: "coach1-custom-routine",
                startDate: new Date("2026-11-01"),
                endDate: new Date("2026-12-01"),
              },
              coach1Id,
              Roles.TRAINER,
            );
          },
          (err: any) =>
            err.statusCode === 403 &&
            err.message.includes("You can only assign workouts to members with an active coaching relationship"),
        );
      } finally {
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.user.findFirst = origUserFindFirst;
        prisma.coachMemberRelationship.findFirst = origCoachRelFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
      }
    });

    it("rejects coach from assigning another coach's private workout", async () => {
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origUserFindFirst = prisma.user.findFirst;

      (prisma.workout as any).findFirst = async () => ({
        id: "coach2-private-routine",
        title: "Coach 2 Secret Routine",
        createdBy: coach2Id, // Private to Coach 2
        isTemplate: false,
        isActive: true,
      });

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where.id === memberId) {
          return { id: memberId, role: Roles.MEMBER, isActive: true };
        }
        return { id: coach1Id, role: Roles.TRAINER, isActive: true };
      };

      try {
        await assert.rejects(
          async () => {
            await assignmentService.create(
              {
                member: memberId,
                workout: "coach2-private-routine",
                startDate: new Date("2026-11-01"),
                endDate: new Date("2026-12-01"),
              },
              coach1Id, // Coach 1 trying to assign Coach 2's routine
              Roles.TRAINER,
            );
          },
          (err: any) =>
            err.statusCode === 403 &&
            err.message.includes("Coaches can only assign workouts they created or template workouts"),
        );
      } finally {
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.user.findFirst = origUserFindFirst;
      }
    });

    it("allows admin to assign workouts without an active coaching relationship", async () => {
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origUserFindFirst = prisma.user.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origAssignmentCreate = prisma.assignment.create;
      const origNotificationCreate = prisma.notification.create;

      (prisma.workout as any).findFirst = async () => ({
        id: "admin-template-routine",
        title: "Admin Strength Plan",
        createdBy: "admin-uuid",
        isTemplate: true,
        isActive: true,
      });

      (prisma.user as any).findFirst = async ({ where }: any) => {
        if (where.id === memberId) {
          return { id: memberId, role: Roles.MEMBER, isActive: true };
        }
        return { id: coach1Id, role: Roles.TRAINER, isActive: true };
      };

      (prisma.assignment as any).findFirst = async () => null;
      (prisma.notification as any).create = async () => ({ id: "notif-uuid" });

      let createdData: any = null;
      (prisma.assignment as any).create = async ({ data }: any) => {
        createdData = data;
        return {
          id: "admin-created-assignment",
          ...data,
          status: "ACTIVE",
          isActive: true,
          trainer: { id: data.trainerId, name: "Coach 1" },
          member: { id: data.memberId, name: "Member A" },
          workout: { id: data.workoutId, title: "Admin Strength Plan" },
        };
      };

      try {
        const result = await assignmentService.create(
          {
            member: memberId,
            workout: "admin-template-routine",
            trainer: coach1Id,
            startDate: new Date("2026-11-01"),
            endDate: new Date("2026-12-01"),
          },
          "admin-uuid",
          Roles.ADMIN,
        );

        assert.ok(result);
        assert.equal(createdData.memberId, memberId);
        assert.equal(createdData.trainerId, coach1Id);
      } finally {
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.user.findFirst = origUserFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.assignment.create = origAssignmentCreate;
        prisma.notification.create = origNotificationCreate;
      }
    });
  });

  describe("5. Member Selector & Google OAuth Identity Persistence", () => {
    it("returns all members without 10-item pagination truncation when querying users", async () => {
      const members = await userService.getAll({ role: "member" });
      assert.ok(Array.isArray(members));
      // Database has 15+ real gym members seeded; verify it is not truncated to 10
      assert.ok(members.length > 10, `Expected > 10 members, got ${members.length}`);

      // All returned members must have role member
      for (const m of members) {
        assert.equal(m.role, "member");
      }
    });

    it("verifies Google OAuth registered user exists with verified email and name in database", async () => {
      const googleUser = await prisma.user.findFirst({
        where: { email: "eman8281@gmail.com" },
      });

      assert.ok(googleUser, "Google OAuth member must exist in the database");
      assert.equal(googleUser.email, "eman8281@gmail.com");
      assert.equal(googleUser.name, "Hosam eldin Mostafa");
      assert.equal(googleUser.role, "member");
      assert.equal(googleUser.isEmailVerified, true);
      assert.ok(googleUser.googleId, "Google ID must be set");

      // Verify that this user is included in the member list retrieved by userService
      const allMembers = await userService.getAll({ role: "member" });
      const foundInList = allMembers.find((m) => m.email === "eman8281@gmail.com");
      assert.ok(foundInList, "Google OAuth member must be present in member query results");
      assert.equal(foundInList.name, "Hosam eldin Mostafa");
    });
  });
});
